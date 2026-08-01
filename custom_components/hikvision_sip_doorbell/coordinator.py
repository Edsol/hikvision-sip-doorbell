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
    ASTDB_CHANNEL_RING,
    ASTDB_FAMILY,
    ASTDB_KEY_CHANNEL,
    ASTDB_KEY_ENDPOINT,
    ASTDB_KEY_FALLBACK,
    ASTDB_KEY_MODE,
    AMI_WAIT_ON_FALLBACK_S,
    CONF_CALL_STATE_ENTITY,
    CONF_DEACTIVATED_BEHAVIOR,
    CONF_DEVICE_ID,
    CONF_DOORBELL_EXTENSION,
    CONF_ENABLED_MODES,
    CONF_EXTRA_INTERNAL_EXTENSIONS,
    CONF_INTERNAL_EXTENSION,
    CONF_INTERNAL_FALLBACK,
    CONF_MODE_PHONE_MAP,
    CONF_MONITOR_STATE_ENTITY,
    CONF_SIP_DOMAIN,
    CONF_SIP_TRUNK,
    DEACTIVATED_BEHAVIOR_OPTIONS,
    DEFAULT_DEACTIVATED_BEHAVIOR,
    DEFAULT_DOORBELL_EXTENSION,
    DEFAULT_INTERNAL_FALLBACK,
    DEFAULT_SIP_DOMAIN,
    DIAL_ROUTE,
    DOMAIN,
    DOORBELL_MODES,
    EXTERNAL_MODES,
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
        self._extra_internal_exts: list[str] = list(
            entry.data.get(CONF_EXTRA_INTERNAL_EXTENSIONS, [])
        )
        self._sip_trunk: str = entry.data[CONF_SIP_TRUNK]
        self._sip_domain: str = entry.data.get(CONF_SIP_DOMAIN, DEFAULT_SIP_DOMAIN)
        self._enabled_modes: list[str] = list(entry.data.get(CONF_ENABLED_MODES, DOORBELL_MODES))
        self._mode_phone_map: dict[str, list[str]] = dict(entry.data.get(CONF_MODE_PHONE_MAP, {}))
        self._selected_phone_entity: str = ""  # entity_id chosen per-mode, persisted in storage
        self._internal_fallback: str = entry.data.get(CONF_INTERNAL_FALLBACK, DEFAULT_INTERNAL_FALLBACK)
        self._deactivated_behavior: str = entry.data.get(CONF_DEACTIVATED_BEHAVIOR, DEFAULT_DEACTIVATED_BEHAVIOR)
        self._call_state_entity: str = entry.data.get(CONF_CALL_STATE_ENTITY, "")
        self._monitor_state_entity: str = entry.data.get(CONF_MONITOR_STATE_ENTITY, "")

        self._storage: Store = Store(
            hass, STORAGE_VERSION, STORAGE_KEY_TPL.format(entry_id=entry.entry_id)
        )
        self._unsub_listeners: list[Any] = []

        # Runtime state
        self.mode: str = DOORBELL_MODES[0]
        self.call_state: str = "idle"
        self.monitor_state: str = "unknown"   # mirrored from the optional monitor MQTT sensor
        self.last_answered_by: str = "none"   # extension that picked up the last call

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
    def deactivated_behavior(self) -> str:
        return self._deactivated_behavior

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
        if mode in EXTERNAL_MODES:
            phone = self.number_to_call
            label = self.selected_phone_entity
            configured = self.phone_entities_for_mode(mode)
            if not configured:
                return f"Modalità {mode} attiva ma nessun numero configurato." if it else f"Mode {mode} active but no phone numbers configured."
            if phone:
                suffix = f" ({label})" if label else ""
                return f"Chiamerà il numero esterno {phone}{suffix} via trunk SIP." if it else f"Will call {phone}{suffix} via SIP trunk."
            return f"Modalità {mode} attiva ma il numero selezionato non è disponibile." if it else f"Mode {mode} active but selected number is unavailable."
        # at_home (or any internal mode)
        reg_exts = self._registered_internal_exts()
        if reg_exts:
            joined = ", ".join(reg_exts)
            if len(reg_exts) > 1:
                return f"Chiamerà gli interni {joined} insieme." if it else f"Will ring indoor extensions {joined} together."
            return f"Chiamerà l'interno {joined}." if it else f"Will ring indoor extension {joined}."
        fallback = self._internal_fallback
        if fallback == "call_external":
            phone = self.number_to_call
            label = self.selected_phone_entity
            if phone:
                suffix = f" ({label})" if label else ""
                return f"Interno {ext} non registrato. Chiamerà il numero esterno {phone}{suffix}." if it else f"Indoor extension {ext} not registered. Will call {phone}{suffix}."
            return f"Interno {ext} non registrato. Fallback esterno ma nessun numero configurato." if it else f"Indoor extension {ext} not registered. Fallback is call external but no number configured."
        if fallback == "none":
            return f"Interno {ext} non registrato. La chiamata verrà ignorata." if it else f"Indoor extension {ext} not registered. Call will be ignored."
        # wait
        return f"Interno {ext} non registrato. Squilla comunque e aspetta 45s." if it else f"Indoor extension {ext} not registered. Will ring anyway and wait 45s."

    # ── Lifecycle ──────────────────────────────────────────────────────────────

    async def async_setup(self) -> None:
        """Load persisted state, write routing to AstDB, subscribe to call_state sensor."""
        await self._async_load_state()
        self._async_subscribe_call_state()
        self._async_subscribe_monitor_state()
        self.hass.async_create_task(self._async_write_routing_db())
        if self._sip_domain == DEFAULT_SIP_DOMAIN:
            self.hass.async_create_task(self._async_discover_sip_domain(force=False))
        self.hass.async_create_task(self._async_subscribe_ami_call_events())

    async def async_unload(self) -> None:
        """Remove state listeners and persist state."""
        for unsub in self._unsub_listeners:
            unsub()
        self._unsub_listeners.clear()
        await self._async_save_state()
        # Remove AMI event listeners
        asterisk_data = self.hass.data.get("asterisk", {})
        entry_data = next(iter(asterisk_data.values()), None)
        if entry_data:
            client = entry_data.get("client")
            if client and hasattr(self, "_ami_bridge_listener"):
                try:
                    client.remove_event_listener(self._ami_bridge_listener)
                    client.remove_event_listener(self._ami_hangup_listener)
                except Exception:
                    pass

    def _ext_from_channel(self, channel: str) -> str:
        """Map an Asterisk channel name to one of our internal extensions.

        'PJSIP/6003-0000000b' → '6003'. Returns '' for channels that belong to
        no configured indoor extension (trunk legs, Local/ test channels).
        """
        for ext in self.all_internal_exts:
            if channel.startswith(f"PJSIP/{ext}-"):
                return ext
        return ""

    async def _async_subscribe_ami_call_events(self) -> None:
        """Listen to Asterisk AMI BridgeEnter/Hangup to update call_state when answered via SIP.

        Hikvision addon only sends 'dismissed' when the doorbell panel closes the call —
        it never sends 'answered' when a SIP client picks up. We detect the answer via
        Asterisk's BridgeEnter event (fired when two call legs are bridged together).
        """
        # Wait for Asterisk integration
        for _ in range(15):
            if self.hass.data.get("asterisk"):
                break
            await asyncio.sleep(1)

        asterisk_data = self.hass.data.get("asterisk", {})
        entry_data = next(iter(asterisk_data.values()), None)
        if entry_data is None:
            _LOGGER.debug("AMI call events: Asterisk integration not available, skipping")
            return

        client = entry_data.get("client")
        if client is None:
            _LOGGER.debug("AMI call events: no AMI client found, skipping")
            return

        doorbell_ext = self._doorbell_ext

        def _on_bridge_enter(event, **kwargs):
            """BridgeEnter fires for each leg — we only care when doorbell is involved."""
            keys = getattr(event, "keys", {}) if not isinstance(event, dict) else event
            channel = keys.get("Channel", "")
            # The answering leg enters the same bridge: record which extension it is.
            if doorbell_ext not in channel:
                answered = self._ext_from_channel(channel)
                if answered and self.call_state in ("ringing", "answered"):
                    self.last_answered_by = answered
                    _LOGGER.info("AMI BridgeEnter: call answered by extension %s", answered)
                    self.hass.loop.call_soon_threadsafe(self.async_update_listeners)
                return
            if self.call_state != "ringing":
                return
            _LOGGER.info("AMI BridgeEnter detected for doorbell — updating call_state to answered")
            self.call_state = "answered"
            self.hass.loop.call_soon_threadsafe(self.async_update_listeners)

        def _on_hangup(event, **kwargs):
            """Hangup fires when any channel closes — update to idle if we were active."""
            keys = getattr(event, "keys", {}) if not isinstance(event, dict) else event
            channel = keys.get("Channel", "")
            if doorbell_ext not in channel:
                return
            if self.call_state not in ("ringing", "answered"):
                return
            _LOGGER.info("AMI Hangup detected for doorbell — updating call_state to idle")
            self.call_state = "idle"
            self.last_answered_by = "none"
            self.hass.loop.call_soon_threadsafe(self.async_update_listeners)

        self._ami_bridge_listener = _on_bridge_enter
        self._ami_hangup_listener = _on_hangup

        try:
            client.add_event_listener(_on_bridge_enter, white_list=["BridgeEnter"])
            client.add_event_listener(_on_hangup, white_list=["Hangup"])
            _LOGGER.info("AMI call event listeners registered (BridgeEnter, Hangup)")
        except Exception as exc:
            _LOGGER.warning("AMI call events: failed to register listeners: %s", exc)

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

    async def async_set_deactivated_behavior(self, behavior: str) -> None:
        """Set the deactivated behavior, persist it, and update AstDB routing."""
        if behavior not in DEACTIVATED_BEHAVIOR_OPTIONS:
            _LOGGER.warning("Unknown deactivated behavior: %s", behavior)
            return
        self._deactivated_behavior = behavior
        await self._async_save_state()
        await self._async_write_routing_db()
        self.async_update_listeners()

    # ── AstDB routing ─────────────────────────────────────────────────────────

    def _is_ext_registered(self, ext: str) -> bool:
        """Check if a given PJSIP extension is currently registered in Asterisk."""
        from homeassistant.helpers import entity_registry as er
        ent_reg = er.async_get(self.hass)
        suffix = f"{ext}_registered"
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

    @property
    def all_internal_exts(self) -> list[str]:
        """Primary internal extension plus any extras, de-duplicated, order preserved."""
        exts = [self._internal_ext, *self._extra_internal_exts]
        return list(dict.fromkeys(e for e in exts if e))

    def _registered_internal_exts(self) -> list[str]:
        """Subset of internal extensions currently registered in Asterisk."""
        return [e for e in self.all_internal_exts if self._is_ext_registered(e)]

    def _is_internal_ext_registered(self) -> bool:
        """True if at least one configured internal extension is registered."""
        return bool(self._registered_internal_exts())

    def _internal_dial(self) -> tuple[str, str]:
        """Return (channel, endpoint) for ringing the indoor extensions.

        Rings every registered extension in parallel via Asterisk's '&' syntax.
        `endpoint` is a single registered extension: the dialplan availability
        guard uses DEVICE_STATE() on it, which accepts only one endpoint name.
        Falls back to all configured extensions when none is registered, so the
        'wait' fallback keeps its original meaning.
        """
        exts = self._registered_internal_exts() or self.all_internal_exts
        channel = "&".join(f"PJSIP/{e}" for e in exts)
        # Guard on a registered extension when there is one; '' skips the check.
        registered = self._registered_internal_exts()
        endpoint = registered[0] if registered else ""
        return channel, endpoint

    def _compute_channel(self) -> tuple[str, str]:
        """Return (channel, endpoint) for the current mode/state.

        channel  — full Asterisk channel string for Dial(), or '' to hang up
        endpoint — PJSIP endpoint name to poll for availability before Dial()
                   (e.g. '6002' for internal, '' for external/deactivated)
        """
        route = DIAL_ROUTE.get(self.mode, "internal")

        if route == "none":
            if self._deactivated_behavior == "ring":
                return ASTDB_CHANNEL_RING, ""
            return "", ""

        if route == "internal":
            if self._is_internal_ext_registered():
                return self._internal_dial()
            fallback = self._internal_fallback
            if fallback == "call_external":
                phone = self.number_to_call
                if phone:
                    return f"{self._sip_trunk}sip:{phone}@{self._sip_domain}", ""
                _LOGGER.warning("AstDB routing: fallback=call_external but no number configured")
                return "", ""
            if fallback == "none":
                return "", ""
            # fallback == "wait" — pass endpoint so dialplan polls for availability
            return f"PJSIP/{self._internal_ext}", self._internal_ext

        # external mode
        phone = self.number_to_call
        if not phone:
            _LOGGER.warning(
                "AstDB routing: mode=%s requires external routing but no number configured, "
                "falling back to internal",
                self.mode,
            )
            return self._internal_dial()
        return f"{self._sip_trunk}sip:{phone}@{self._sip_domain}", ""

    async def _async_write_routing_db(self, _retry: int = 0) -> None:
        """Write current routing to Asterisk AstDB via AMI DBPut.

        Asterisk dialplan reads routing/channel at ring time and dials directly,
        with no HA involvement in the call path.
        Retries up to 3 times with 5s delay if the asterisk service is not yet available.
        """
        if not self.hass.services.has_service("asterisk", "send_action"):
            if _retry < 3:
                _LOGGER.debug("AstDB write: asterisk service not ready, retrying in 5s (attempt %d/3)", _retry + 1)
                await asyncio.sleep(5)
                await self._async_write_routing_db(_retry + 1)
            else:
                _LOGGER.warning("AstDB write: asterisk service unavailable after 3 attempts — use 'Sync Routing to Asterisk' button when ready")
            return

        channel, endpoint = self._compute_channel()
        _LOGGER.info("AstDB routing update — mode=%s, channel=%s, endpoint=%s", self.mode, channel or "(hangup)", endpoint or "(none)")

        try:
            for key, val in (
                (ASTDB_KEY_CHANNEL, channel),
                (ASTDB_KEY_ENDPOINT, endpoint),
                (ASTDB_KEY_MODE, self.mode),
                (ASTDB_KEY_FALLBACK, self._internal_fallback),
            ):
                await self.hass.services.async_call(
                    "asterisk",
                    "send_action",
                    {"action": "DBPut", "parameters": {
                        "Family": ASTDB_FAMILY,
                        "Key": key,
                        "Val": val,
                    }},
                    blocking=False,
                )
        except Exception as exc:
            _LOGGER.error("AstDB DBPut failed: %s", exc)

    async def async_originate_test_ring(self) -> None:
        """Originate a call into the doorbell dialplan, as a real ring would.

        Lets the configured routing be exercised without pressing the physical
        button. The originating leg is synthetic, so no video is carried — this
        verifies routing and ringing only.
        """
        if not self.hass.services.has_service("asterisk", "send_action"):
            _LOGGER.warning("Test ring: asterisk service unavailable")
            return
        # Local channel into [from-door]; the extension only has to match _X.
        try:
            await self.hass.services.async_call(
                "asterisk",
                "send_action",
                {"action": "Originate", "parameters": {
                    "Channel": f"Local/{self._doorbell_ext}@from-door",
                    "Application": "Wait",
                    "Data": "30",
                    "CallerID": "Doorbell Test",
                    "Async": "true",
                }},
                blocking=False,
            )
            _LOGGER.info("Test ring originated into [from-door]")
        except Exception as exc:
            _LOGGER.error("Test ring failed: %s", exc)

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

    @callback
    def _async_subscribe_monitor_state(self) -> None:
        """Mirror an indoor monitor's MQTT call_state sensor, when configured.

        Diagnostics only: the monitor is rung through Asterisk like any other
        endpoint, so this never feeds into routing decisions.
        """
        if not self._monitor_state_entity:
            return

        @callback
        def _on_monitor_state(event: Event) -> None:
            new_state = event.data.get("new_state")
            if new_state is None:
                return
            self.monitor_state = new_state.state.strip()
            self.async_update_listeners()

        current = self.hass.states.get(self._monitor_state_entity)
        if current is not None:
            self.monitor_state = current.state.strip()

        self._unsub_listeners.append(
            async_track_state_change_event(
                self.hass, [self._monitor_state_entity], _on_monitor_state
            )
        )
        _LOGGER.info("Tracking indoor monitor state via %s", self._monitor_state_entity)

    # ── Persistence ────────────────────────────────────────────────────────────

    async def _async_load_state(self) -> None:
        data = await self._storage.async_load()
        if data:
            self.mode = data.get("mode", DOORBELL_MODES[0])
            self._internal_fallback = data.get("internal_fallback", self._internal_fallback)
            self._deactivated_behavior = data.get("deactivated_behavior", self._deactivated_behavior)
            self._selected_phone_entity = data.get("selected_phone_entity", "")

    async def _async_save_state(self) -> None:
        await self._storage.async_save({
            "mode": self.mode,
            "internal_fallback": self._internal_fallback,
            "deactivated_behavior": self._deactivated_behavior,
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
        self._extra_internal_exts = list(
            entry.data.get(CONF_EXTRA_INTERNAL_EXTENSIONS, self._extra_internal_exts)
        )
        self._monitor_state_entity = entry.data.get(
            CONF_MONITOR_STATE_ENTITY, self._monitor_state_entity
        )
        self._sip_trunk = entry.data.get(CONF_SIP_TRUNK, self._sip_trunk)
        self._sip_domain = entry.data.get(CONF_SIP_DOMAIN, self._sip_domain)
        self._internal_fallback = entry.data.get(CONF_INTERNAL_FALLBACK, self._internal_fallback)
        self._deactivated_behavior = entry.data.get(CONF_DEACTIVATED_BEHAVIOR, self._deactivated_behavior)
        self._enabled_modes = list(entry.data.get(CONF_ENABLED_MODES, DOORBELL_MODES))
        self._mode_phone_map = dict(entry.data.get(CONF_MODE_PHONE_MAP, {}))
        # if current mode was disabled, fall back to first enabled mode
        if self.mode not in self._enabled_modes and self._enabled_modes:
            self.mode = self._enabled_modes[0]
        self.hass.async_create_task(self._async_write_routing_db())
        self.async_update_listeners()
