"""Coordinator for the Hikvision SIP Doorbell integration.

Listens to MQTT topics published by the Hikvision Addons doorbell addon
(https://github.com/pergolafabio/Hikvision-Addons/tree/main/doorbell).

When call_state=ringing is received, the coordinator triggers an AMI Originate
via the HA Asterisk integration (asterisk.send_action) to route the call based
on the current mode:

  at_home       → Originate to internal extension (PJSIP/<internal_extension>)
  away_from_home → Originate to external number via SIP trunk
  vacation      → Originate to external number via SIP trunk
  deactivated   → No Originate — doorbell rings but call is not answered

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
    AMI_CALLER_ID_NAME,
    AMI_CONTEXT_EXTERNAL,
    AMI_CONTEXT_INTERNAL,
    AMI_TIMEOUT_MS,
    AMI_WAIT_ON_FALLBACK_S,
    CONF_CALL_STATE_ENTITY,
    CONF_DEVICE_ID,
    CONF_DOORBELL_EXTENSION,
    CONF_INTERNAL_EXTENSION,
    CONF_INTERNAL_FALLBACK,
    CONF_MODE_MAP,
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
        self._mode_map: dict[str, str] = dict(entry.data.get(CONF_MODE_MAP, {}))
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
    def number_to_call(self) -> str:
        """Phone number configured for the current mode (empty for internal/none)."""
        entity_id = self._mode_map.get(self.mode)
        if not entity_id:
            return ""
        state = self.hass.states.get(entity_id)
        if state is None or state.state in ("unknown", "unavailable", ""):
            return ""
        return state.state

    # ── Lifecycle ──────────────────────────────────────────────────────────────

    async def async_setup(self) -> None:
        """Load persisted state, subscribe to call_state sensor, and auto-discover sip_domain."""
        await self._async_load_state()
        self._async_subscribe_call_state()
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
        """Set the doorbell operating mode and persist it."""
        if mode not in DOORBELL_MODES:
            _LOGGER.warning("Unknown doorbell mode: %s", mode)
            return
        self.mode = mode
        await self._async_save_state()
        self.async_update_listeners()

    async def async_set_internal_fallback(self, fallback: str) -> None:
        """Set the internal fallback behaviour and persist it."""
        if fallback not in INTERNAL_FALLBACK_OPTIONS:
            _LOGGER.warning("Unknown internal fallback: %s", fallback)
            return
        self._internal_fallback = fallback
        await self._async_save_state()
        self.async_update_listeners()

    # ── AMI Originate ─────────────────────────────────────────────────────────

    def _is_internal_ext_registered(self) -> bool:
        """Check if the internal extension is currently registered in Asterisk.

        Looks for a binary_sensor from the Asterisk integration whose
        unique_id ends with '<extension>_registered' and whose state is 'on'.
        Returns True if found and registered, False if not registered or unknown.
        """
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

    async def _async_originate(self) -> None:
        """Trigger AMI Originate based on current mode."""
        route = DIAL_ROUTE.get(self.mode, "internal")

        if route == "none":
            _LOGGER.info("Doorbell ringing — mode=deactivated, no call placed")
            return

        if route == "internal":
            if self._is_internal_ext_registered():
                channel = f"PJSIP/{self._internal_ext}"
                context = AMI_CONTEXT_INTERNAL
                exten = self._internal_ext
            else:
                # Internal extension not registered — apply configured fallback
                fallback = self._internal_fallback
                _LOGGER.info(
                    "Doorbell ringing — internal ext %s not registered, fallback=%s",
                    self._internal_ext, fallback,
                )
                if fallback == "call_external":
                    phone = self.number_to_call
                    if phone:
                        channel = f"{self._sip_trunk}sip:{phone}@{self._sip_domain}"
                        context = AMI_CONTEXT_EXTERNAL
                        exten = self._internal_ext
                    else:
                        _LOGGER.warning(
                            "Doorbell ringing — fallback=call_external but no number configured, giving up"
                        )
                        return
                elif fallback == "none":
                    return
                else:
                    # fallback == "wait": send Originate anyway, dialplan keeps channel open
                    channel = f"PJSIP/{self._internal_ext}"
                    context = AMI_CONTEXT_INTERNAL
                    exten = self._internal_ext
        else:
            phone = self.number_to_call
            if not phone:
                _LOGGER.warning(
                    "Doorbell ringing — mode=%s requires external routing but no number configured, "
                    "falling back to internal",
                    self.mode,
                )
                channel = f"PJSIP/{self._internal_ext}"
                context = AMI_CONTEXT_INTERNAL
                exten = self._internal_ext
            else:
                channel = f"{self._sip_trunk}sip:{phone}@{self._sip_domain}"
                context = AMI_CONTEXT_EXTERNAL
                exten = self._internal_ext

        _LOGGER.info("Doorbell ringing — mode=%s, originating to %s", self.mode, channel)

        caller_id = f"{AMI_CALLER_ID_NAME} <{self._doorbell_ext}>"
        parameters = {
            "Channel": channel,
            "Context": context,
            "Exten": exten,
            "Priority": "1",
            "Timeout": AMI_TIMEOUT_MS,
            "CallerID": caller_id,
            "Async": "true",
        }

        try:
            await self.hass.services.async_call(
                "asterisk",
                "send_action",
                {"action": "Originate", "parameters": parameters},
                blocking=False,
            )
        except Exception as exc:
            _LOGGER.error("AMI Originate failed: %s", exc)

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
            if value == "ringing":
                self.hass.async_create_task(self._async_originate())

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

    async def _async_save_state(self) -> None:
        await self._storage.async_save({
            "mode": self.mode,
            "internal_fallback": self._internal_fallback,
        })

    # ── DataUpdateCoordinator override ────────────────────────────────────────

    async def _async_update_data(self) -> None:
        """No-op — state is pushed via MQTT."""

    # ── Helpers ────────────────────────────────────────────────────────────────

    def update_entry_data(self, entry: ConfigEntry) -> None:
        """Refresh runtime config after options flow update."""
        self._doorbell_ext = entry.data.get(CONF_DOORBELL_EXTENSION, self._doorbell_ext)
        self._internal_ext = entry.data.get(CONF_INTERNAL_EXTENSION, self._internal_ext)
        self._sip_trunk = entry.data.get(CONF_SIP_TRUNK, self._sip_trunk)
        self._sip_domain = entry.data.get(CONF_SIP_DOMAIN, self._sip_domain)
        self._mode_map = dict(entry.data.get(CONF_MODE_MAP, self._mode_map))
        self._internal_fallback = entry.data.get(CONF_INTERNAL_FALLBACK, self._internal_fallback)
        self.async_update_listeners()
