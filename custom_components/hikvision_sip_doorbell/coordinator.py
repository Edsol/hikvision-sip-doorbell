"""Coordinator for the Hikvision SIP Doorbell integration.

Listens to MQTT topics published by the Hikvision Addons doorbell addon
(https://github.com/pergolafabio/Hikvision-Addons/tree/main/doorbell).

Routing is handled via Asterisk AstDB — HA writes the target channel to
AstDB whenever the mode, phone number, or fallback changes. Asterisk reads
it at ring time and dials directly, with no HA involvement in the call path.

  at_home       → AstDB routing/channel = PJSIP/<internal_extension>
  away_from_home → AstDB routing/channel = PJSIP/<trunk>/sip:<phone>@<domain>
  vacation      → AstDB routing/channel = PJSIP/<trunk>/sip:<phone>@<domain>
  deactivated   → AstDB routing/channel = "" (Asterisk hangs up)

Phone numbers for external modes are resolved from mode_map stored in the
config entry: {"away_from_home": "input_text.my_phone", ...}

MQTT topics consumed:
  hikvision/<device_id>/call_state   → idle / ringing / answered / dismissed
  hikvision/<device_id>/contact      → contact name shown on the panel
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    ASTDB_FAMILY,
    ASTDB_KEY_CHANNEL,
    ASTDB_KEY_FALLBACK,
    ASTDB_KEY_MODE,
    AMI_WAIT_ON_FALLBACK_S,
    CONF_CALL_STATE_ENTITY,
    CONF_DEVICE_ID,
    CONF_DOORBELL_EXTENSION,
    CONF_ENABLED_MODES,
    CONF_INTERNAL_EXTENSION,
    CONF_INTERNAL_FALLBACK,
    CONF_MODE_PHONE_MAP,
    CONF_SIP_DOMAIN,
    CONF_SIP_TRUNK,
    DEFAULT_DOORBELL_EXTENSION,
    DEFAULT_INTERNAL_FALLBACK,
    DEFAULT_SIP_DOMAIN,
    DIAL_ROUTE,
    DOMAIN,
    DOORBELL_MODES,
    INTERNAL_FALLBACK_OPTIONS,
)

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_KEY_TPL = f"{DOMAIN}_{{entry_id}}"


class DoorbellCoordinator(DataUpdateCoordinator):
    """Central coordinator — holds all runtime state for one doorbell device."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=None,
        )
        self._entry = entry
        self._device_id: str = entry.data[CONF_DEVICE_ID]
        self._doorbell_ext: str = entry.data.get(CONF_DOORBELL_EXTENSION, DEFAULT_DOORBELL_EXTENSION)
        self._internal_ext: str = entry.data[CONF_INTERNAL_EXTENSION]
        self._sip_trunk: str = entry.data[CONF_SIP_TRUNK]
        self._sip_domain: str = entry.data.get(CONF_SIP_DOMAIN, DEFAULT_SIP_DOMAIN)
        self._enabled_modes: list[str] = list(entry.data.get(CONF_ENABLED_MODES, DOORBELL_MODES))
        self._mode_phone_map: dict[str, list[str]] = dict(entry.data.get(CONF_MODE_PHONE_MAP, {}))
        self._selected_phone_entity: str = ""  # entity_id chosen per-mode, persisted in storage
        self._internal_fallback: str = entry.data.get(CONF_INTERNAL_FALLBACK, DEFAULT_INTERNAL_FALLBACK)
        self._call_state_entity: str = entry.data.get(CONF_CALL_STATE_ENTITY, "")

        self._storage: Store = Store(
            hass, STORAGE_VERSION, STORAGE_KEY_TPL.format(entry_id=entry.entry_id)
        )
        self._unsub_listeners: list[Any] = []

        # Runtime state
        self.mode: str = DOORBELL_MODES[0]
        self.call_state: str = "idle"

    # ── Config properties (exposed to diagnostic sensors) ─────────────────────

    @property
    def doorbell_ext(self) -> str:
        return self._doorbell_ext

    @property
    def internal_ext(self) -> str:
        return self._internal_ext

    @property
    def sip_trunk(self) -> str:
        return self._sip_trunk

    @property
    def sip_domain(self) -> str:
        return self._sip_domain

    @property
    def internal_fallback(self) -> str:
        return self._internal_fallback

    @property
    def enabled_modes(self) -> list[str]:
        return self._enabled_modes

    def phone_entities_for_mode(self, mode: str) -> list[str]:
        """Return friendly names of phone entities configured for the given mode."""
        entity_ids = self._mode_phone_map.get(mode, [])
        names = []
        for entity_id in entity_ids:
            state = self.hass.states.get(entity_id)
            name = (state.attributes.get("friendly_name") if state else None) or entity_id
            names.append(name)
        return names

    def _entity_id_from_friendly_name(self, name: str, mode: str | None = None) -> str | None:
        """Resolve a friendly name back to its entity_id, scoped to the given mode (or current)."""
        search_mode = mode or self.mode
        entity_ids = self._mode_phone_map.get(search_mode, [])
        for entity_id in entity_ids:
            state = self.hass.states.get(entity_id)
            friendly = (state.attributes.get("friendly_name") if state else None) or entity_id
            if friendly == name:
                return entity_id
        return None

    @property
    def selected_phone_entity(self) -> str:
        """Return the friendly name of the currently selected phone entity for the current mode."""
        if not self._selected_phone_entity:
            return ""
        state = self.hass.states.get(self._selected_phone_entity)
        return (state.attributes.get("friendly_name") if state else None) or self._selected_phone_entity

    @property
    def number_to_call(self) -> str:
        """Phone number from the selected entity for the current mode, empty if none."""
        entity_id = self._selected_phone_entity
        if not entity_id:
            # auto-select first configured entity for this mode
            entity_ids = self._mode_phone_map.get(self.mode, [])
            entity_id = entity_ids[0] if entity_ids else ""
        if not entity_id:
            return ""
        state = self.hass.states.get(entity_id)
        if state is None or state.state in ("unknown", "unavailable", ""):
            return ""
        return state.state

    def behavior_summary(self, lang: str = "en") -> str:
        """Human-readable description of current routing behaviour, in the given language."""
        it = lang.startswith("it")
        mode = self.mode
        ext = self._internal_ext
        if mode == "deactivated":
            return "Videocitofono disattivato. Le chiamate verranno ignorate." if it else "Doorbell is deactivated. Calls will be ignored."
        if mode in ("away_from_home", "vacation"):
            phone = self.number_to_call
            label = self.selected_phone_entity or "—"
            if phone:
                return f"Chiamerà il numero esterno {phone} ({label}) via trunk SIP." if it else f"Will call {phone} ({label}) via SIP trunk."
            return f"Modalità esterna attiva ma nessun numero impostato in '{label}'." if it else f"External mode active but no number set in '{label}'."
        # at_home
        registered = self._is_internal_ext_registered()
        if registered:
            return f"Chiamerà l'interno {ext}." if it else f"Will ring indoor extension {ext}."
        fallback = self._internal_fallback
        if fallback == "call_external":
            phone = self.number_to_call
            label = self.selected_phone_entity or "—"
            if phone:
                return f"Interno {ext} non registrato. Chiamerà il numero esterno {phone} ({label})." if it else f"Indoor extension {ext} not registered. Will call {phone} ({label})."
            return f"Interno {ext} non registrato. Fallback esterno ma nessun numero impostato in '{label}'." if it else f"Indoor extension {ext} not registered. Fallback is call external but no number set in '{label}'."
        if fallback == "none":
            return f"Interno {ext} non registrato. La chiamata verrà ignorata." if it else f"Indoor extension {ext} not registered. Call will be ignored."
        # wait
        return f"Interno {ext} non registrato. Squilla comunque e aspetta {AMI_WAIT_ON_FALLBACK_S}s." if it else f"Indoor extension {ext} not registered. Will ring anyway and wait {AMI_WAIT_ON_FALLBACK_S}s."

    # ── Lifecycle ──────────────────────────────────────────────────────────────

    async def async_setup(self) -> None:
        """Load persisted state, write routing to AstDB, subscribe to call_state sensor."""
        await self._async_load_state()
        self._async_subscribe_call_state()
        self.hass.async_create_task(self._async_write_routing_db())
        if self._sip_domain == DEFAULT_SIP_DOMAIN:
            self.hass.async_create_task(self._async_discover_sip_domain(force=False))

    async def async_unload(self) -> None:
        """Remove state listeners and persist state."""
        for unsub in self._unsub_listeners:
            unsub()
        self._unsub_listeners.clear()
        await self._async_save_state()

    # ── SIP domain auto-discovery ─────────────────────────────────────────────

    async def _async_discover_sip_domain(self, force: bool = False) -> None:
        """Query Asterisk AMI for the trunk's FromDomain and persist it.

        Sends PJSIPShowEndpoint for the configured trunk, listens for the
        EndpointDetail event, and extracts FromDomain.
        Runs automatically on setup if sip_domain is still the placeholder.
        Can be forced via button.discover_sip_domain (force=True).
        """
        trunk_name = self._sip_trunk.rstrip("/").split("/")[-1]
        if not trunk_name:
            _LOGGER.warning("SIP domain discovery: cannot parse trunk name from '%s'", self._sip_trunk)
            return

        if not force and self._sip_domain != DEFAULT_SIP_DOMAIN:
            return

        # Wait for Asterisk integration to be available
        for _ in range(15):
            if self.hass.data.get("asterisk"):
                break
            await asyncio.sleep(1)

        asterisk_data = self.hass.data.get("asterisk", {})
        entry_data = next(iter(asterisk_data.values()), None)
        if entry_data is None:
            _LOGGER.warning("SIP domain discovery: Asterisk integration not available")
            return

        from asterisk.ami import SimpleAction

        client = entry_data.get("client")
        if client is None:
            _LOGGER.warning("SIP domain discovery: no AMI client found")
            return

        discovered: dict = {}
        done = asyncio.Event()

        def _on_detail(event, **kwargs):
            keys = getattr(event, "keys", {}) if not isinstance(event, dict) else event
            if keys.get("ObjectName", "") != trunk_name:
                return
            domain = keys.get("FromDomain", "")
            if domain:
                discovered["domain"] = domain
            done.set()

        def _on_complete(event, **kwargs):
            done.set()

        try:
            client.add_event_listener(_on_detail, white_list=["EndpointDetail"])
            client.add_event_listener(_on_complete, white_list=["EndpointDetailComplete"])
            client.send_action(SimpleAction("PJSIPShowEndpoint", Endpoint=trunk_name))
            try:
                await asyncio.wait_for(asyncio.shield(done.wait()), timeout=5.0)
            except asyncio.TimeoutError:
                _LOGGER.warning("SIP domain discovery: timeout waiting for AMI response")
        finally:
            try:
                client.remove_event_listener(_on_detail)
                client.remove_event_listener(_on_complete)
            except Exception:
                pass

        domain = discovered.get("domain", "")
        if not domain:
            _LOGGER.warning("SIP domain discovery: FromDomain not found for trunk '%s'", trunk_name)
            return

        _LOGGER.info("SIP domain discovered: %s (trunk: %s)", domain, trunk_name)
        self._sip_domain = domain
        new_data = {**self._entry.data, CONF_SIP_DOMAIN: domain}
        self.hass.config_entries.async_update_entry(self._entry, data=new_data)
        self.async_update_listeners()

    # ── Mode management (called by select entity) ──────────────────────────────

    async def async_set_mode(self, mode: str) -> None:
        """Set the doorbell operating mode, persist it, and update AstDB routing."""
        if mode not in self._enabled_modes:
            _LOGGER.warning("Unknown or disabled doorbell mode: %s", mode)
            return
        self.mode = mode
        self._selected_phone_entity = ""  # reset to auto-select first number for new mode
        await self._async_save_state()
        await self._async_write_routing_db()
        self.async_update_listeners()

    async def async_set_selected_phone_entity(self, name_or_entity_id: str) -> None:
        """Set the selected phone entity (accepts friendly name or entity_id), persist, update AstDB."""
        resolved = self._entity_id_from_friendly_name(name_or_entity_id)
        self._selected_phone_entity = resolved or name_or_entity_id
        await self._async_save_state()
        await self._async_write_routing_db()
        self.async_update_listeners()

    async def async_set_internal_fallback(self, fallback: str) -> None:
        """Set the internal fallback behaviour, persist it, and update AstDB routing."""
        if fallback not in INTERNAL_FALLBACK_OPTIONS:
            _LOGGER.warning("Unknown internal fallback: %s", fallback)
            return
        self._internal_fallback = fallback
        await self._async_save_state()
        await self._async_write_routing_db()
        self.async_update_listeners()

    # ── AstDB routing ─────────────────────────────────────────────────────────

    def _is_internal_ext_registered(self) -> bool:
        """Check if the internal extension is currently registered in Asterisk."""
        from homeassistant.helpers import entity_registry as er
        ent_reg = er.async_get(self.hass)
        suffix = f"{self._internal_ext}_registered"
        for entry in ent_reg.entities.values():
            if (
                entry.platform == "asterisk"
                and entry.unique_id
                and entry.unique_id.endswith(suffix)
            ):
                state = self.hass.states.get(entry.entity_id)
                if state is not None:
                    return state.state == "on"
        return False

    def _compute_channel(self) -> str:
        """Return the Asterisk channel string for the current mode/state, or '' to hang up."""
        route = DIAL_ROUTE.get(self.mode, "internal")

        if route == "none":
            return ""

        if route == "internal":
            if self._is_internal_ext_registered():
                return f"PJSIP/{self._internal_ext}"
            fallback = self._internal_fallback
            if fallback == "call_external":
                phone = self.number_to_call
                if phone:
                    return f"{self._sip_trunk}sip:{phone}@{self._sip_domain}"
                _LOGGER.warning("AstDB routing: fallback=call_external but no number configured")
                return ""
            if fallback == "none":
                return ""
            # fallback == "wait"
            return f"PJSIP/{self._internal_ext}"

        # external mode
        phone = self.number_to_call
        if not phone:
            _LOGGER.warning(
                "AstDB routing: mode=%s requires external routing but no number configured, "
                "falling back to internal",
                self.mode,
            )
            return f"PJSIP/{self._internal_ext}"
        return f"{self._sip_trunk}sip:{phone}@{self._sip_domain}"

    async def _async_write_routing_db(self) -> None:
        """Write current routing to Asterisk AstDB via AMI DBPut.

        Asterisk dialplan reads routing/channel at ring time and dials directly,
        with no HA involvement in the call path.
        """
        channel = self._compute_channel()
        _LOGGER.info("AstDB routing update — mode=%s, channel=%s", self.mode, channel or "(hangup)")

        try:
            await self.hass.services.async_call(
                "asterisk",
                "send_action",
                {"action": "DBPut", "parameters": {
                    "Family": ASTDB_FAMILY,
                    "Key": ASTDB_KEY_CHANNEL,
                    "Val": channel,
                }},
                blocking=False,
            )
            await self.hass.services.async_call(
                "asterisk",
                "send_action",
                {"action": "DBPut", "parameters": {
                    "Family": ASTDB_FAMILY,
                    "Key": ASTDB_KEY_MODE,
                    "Val": self.mode,
                }},
                blocking=False,
            )
            await self.hass.services.async_call(
                "asterisk",
                "send_action",
                {"action": "DBPut", "parameters": {
                    "Family": ASTDB_FAMILY,
                    "Key": ASTDB_KEY_FALLBACK,
                    "Val": self._internal_fallback,
                }},
                blocking=False,
            )
        except Exception as exc:
            _LOGGER.error("AstDB DBPut failed: %s", exc)

    # ── State tracking ────────────────────────────────────────────────────────

    @callback
    def _async_subscribe_call_state(self) -> None:
        """Track state changes on the Hikvision MQTT call_state sensor."""
        if not self._call_state_entity:
            _LOGGER.warning(
                "No call_state entity configured — doorbell will not trigger calls. "
                "Re-configure the integration to fix this."
            )
            return

        @callback
        def _on_call_state(event: Event) -> None:
            new_state = event.data.get("new_state")
            if new_state is None:
                return
            value = new_state.state.strip()
            self.call_state = value
            self.async_update_listeners()

        self._unsub_listeners.append(
            async_track_state_change_event(
                self.hass, [self._call_state_entity], _on_call_state
            )
        )
        _LOGGER.info("Tracking call state via %s", self._call_state_entity)

    # ── Persistence ────────────────────────────────────────────────────────────

    async def _async_load_state(self) -> None:
        data = await self._storage.async_load()
        if data:
            self.mode = data.get("mode", DOORBELL_MODES[0])
            self._internal_fallback = data.get("internal_fallback", self._internal_fallback)
            self._selected_phone_entity = data.get("selected_phone_entity", "")

    async def _async_save_state(self) -> None:
        await self._storage.async_save({
            "mode": self.mode,
            "internal_fallback": self._internal_fallback,
            "selected_phone_entity": self._selected_phone_entity,
        })

    # ── DataUpdateCoordinator override ────────────────────────────────────────

    async def _async_update_data(self) -> None:
        """No-op — state is pushed via MQTT."""

    # ── Helpers ────────────────────────────────────────────────────────────────

    def update_entry_data(self, entry: ConfigEntry) -> None:
        """Refresh runtime config after options flow update and sync AstDB."""
        self._doorbell_ext = entry.data.get(CONF_DOORBELL_EXTENSION, self._doorbell_ext)
        self._internal_ext = entry.data.get(CONF_INTERNAL_EXTENSION, self._internal_ext)
        self._sip_trunk = entry.data.get(CONF_SIP_TRUNK, self._sip_trunk)
        self._sip_domain = entry.data.get(CONF_SIP_DOMAIN, self._sip_domain)
        self._internal_fallback = entry.data.get(CONF_INTERNAL_FALLBACK, self._internal_fallback)
        self._enabled_modes = list(entry.data.get(CONF_ENABLED_MODES, DOORBELL_MODES))
        self._mode_phone_map = dict(entry.data.get(CONF_MODE_PHONE_MAP, {}))
        # if current mode was disabled, fall back to first enabled mode
        if self.mode not in self._enabled_modes and self._enabled_modes:
            self.mode = self._enabled_modes[0]
        self.hass.async_create_task(self._async_write_routing_db())
        self.async_update_listeners()
