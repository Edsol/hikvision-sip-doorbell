"""Config flow for Hikvision SIP Doorbell integration."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.selector import (
    EntityFilterSelectorConfig,
    EntitySelector,
    EntitySelectorConfig,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)

from .const import (
    CONF_CALL_STATE_ENTITY,
    CONF_DEVICE_ID,
    CONF_DOORBELL_EXTENSION,
    CONF_ENABLED_MODES,
    CONF_INTERNAL_EXTENSION,
    CONF_MODE_PHONE_MAP,
    CONF_SIP_DOMAIN,
    CONF_SIP_TRUNK,
    DEFAULT_SIP_DOMAIN,
    DEFAULT_SIP_TRUNK,
    DIAL_ROUTE,
    DOMAIN,
    DOORBELL_MODES,
    EXTERNAL_MODES,
)

_LOGGER = logging.getLogger(__name__)

_MQTT_SENSOR_SELECTOR = EntitySelector(
    EntitySelectorConfig(
        filter=EntityFilterSelectorConfig(integration="mqtt", domain="sensor"),
        multiple=False,
    )
)

_ASTERISK_ENDPOINT_SELECTOR = EntitySelector(
    EntitySelectorConfig(
        filter=EntityFilterSelectorConfig(integration="asterisk", domain="binary_sensor"),
        multiple=False,
    )
)

_PHONE_ENTITIES_SELECTOR = EntitySelector(
    EntitySelectorConfig(
        filter=EntityFilterSelectorConfig(domain="input_text"),
        multiple=True,
    )
)



# ── Entity resolution helpers ─────────────────────────────────────────────────

def _endpoint_name_from_entity(hass, entity_id: str) -> str | None:
    """Resolve a PJSIP endpoint name from an Asterisk binary_sensor entity."""
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    entry = ent_reg.async_get(entity_id)
    if entry is None or entry.device_id is None:
        return None
    device = dev_reg.async_get(entry.device_id)
    if device is None:
        return None
    name: str = device.name or ""
    if "/" in name:
        return name.split("/", 1)[1]
    return name or None


def _entity_from_endpoint_name(hass, name: str) -> str | None:
    """Reverse lookup: endpoint name (e.g. '6001') → Asterisk entity_id."""
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    for entry in ent_reg.entities.values():
        if entry.platform != "asterisk" or entry.domain != "binary_sensor":
            continue
        if entry.device_id is None:
            continue
        device = dev_reg.async_get(entry.device_id)
        if device is None:
            continue
        dev_name: str = device.name or ""
        part = dev_name.split("/", 1)[-1].rstrip("/") if "/" in dev_name else dev_name
        if part == name or dev_name == name:
            return entry.entity_id
    return None


def _trunk_entity_from_value(hass, trunk_value: str) -> str | None:
    """Reverse lookup: 'PJSIP/iliad-trunk/' → entity_id."""
    name = trunk_value.rstrip("/").split("/")[-1] if "/" in trunk_value else trunk_value
    return _entity_from_endpoint_name(hass, name)


def _device_id_from_mqtt_entity(hass, entity_id: str) -> str | None:
    """Extract the Hikvision MQTT device_id from a sensor entity unique_id."""
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    entry = ent_reg.async_get(entity_id)
    if entry is None:
        return None
    known_suffixes = [
        "_call_state", "_call_status", "_contact", "_caller_info",
        "_door_1_relay", "_backlight_mode", "_isapi_request",
    ]
    uid: str = entry.unique_id or ""
    for suffix in known_suffixes:
        if uid.endswith(suffix):
            return uid[: -len(suffix)]
    if entry.device_id:
        device = dev_reg.async_get(entry.device_id)
        if device and device.name:
            return device.name.lower().replace(" ", "_")
    object_id = entity_id.split(".", 1)[-1]
    return object_id.split("_")[0] if "_" in object_id else None


# ── Config flow ───────────────────────────────────────────────────────────────

class HikvisionSipDoorbellConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Single-step config flow: device + SIP settings."""

    VERSION = 1

    def __init__(self) -> None:
        self._data: dict[str, Any] = {}
        self._errors: dict[str, str] = {}

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        self._errors = {}

        if user_input is not None:
            mqtt_entity = user_input.get(CONF_DEVICE_ID, "")
            if mqtt_entity:
                resolved = _device_id_from_mqtt_entity(self.hass, mqtt_entity)
                if resolved is None:
                    self._errors[CONF_DEVICE_ID] = "device_id_not_found"
                else:
                    user_input[CONF_CALL_STATE_ENTITY] = mqtt_entity
                    user_input[CONF_DEVICE_ID] = resolved

            for field in (CONF_DOORBELL_EXTENSION, CONF_INTERNAL_EXTENSION):
                entity = user_input.get(field, "")
                if entity:
                    resolved = _endpoint_name_from_entity(self.hass, entity)
                    if resolved is None:
                        self._errors[field] = "endpoint_not_found"
                    else:
                        user_input[field] = resolved

            trunk_entity = user_input.get(CONF_SIP_TRUNK, "")
            if trunk_entity:
                resolved = _endpoint_name_from_entity(self.hass, trunk_entity)
                if resolved is None:
                    self._errors[CONF_SIP_TRUNK] = "endpoint_not_found"
                else:
                    user_input[CONF_SIP_TRUNK] = f"PJSIP/{resolved}/"

            if not self._errors:
                await self.async_set_unique_id(user_input[CONF_DEVICE_ID])
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=f"Doorbell ({user_input[CONF_DEVICE_ID]})",
                    data=user_input,
                )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(CONF_DEVICE_ID): _MQTT_SENSOR_SELECTOR,
                vol.Required(CONF_DOORBELL_EXTENSION): _ASTERISK_ENDPOINT_SELECTOR,
                vol.Required(CONF_INTERNAL_EXTENSION): _ASTERISK_ENDPOINT_SELECTOR,
                vol.Required(CONF_SIP_TRUNK): _ASTERISK_ENDPOINT_SELECTOR,
                vol.Required(CONF_SIP_DOMAIN, default=DEFAULT_SIP_DOMAIN): str,
            }),
            errors=self._errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> HikvisionSipDoorbellOptionsFlow:
        return HikvisionSipDoorbellOptionsFlow(config_entry)


# ── Options flow ──────────────────────────────────────────────────────────────

class HikvisionSipDoorbellOptionsFlow(config_entries.OptionsFlow):
    """Menu-driven options flow."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        self._entry = config_entry
        self._data: dict[str, Any] = dict(config_entry.data)
        self._errors: dict[str, str] = {}
        self._pending_mode: str | None = None  # mode being configured in phone_numbers_for_mode step

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        return self.async_show_menu(
            step_id="init",
            menu_options=["sip_settings", "enabled_modes", "phone_numbers", "done"],
            description_placeholders={"title": self._entry.title},
        )

    # ── SIP Settings ──────────────────────────────────────────────────────────

    async def async_step_sip_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        self._errors = {}

        if user_input is not None:
            for field in (CONF_DOORBELL_EXTENSION, CONF_INTERNAL_EXTENSION):
                value = user_input.get(field, "")
                if value and "." in value:
                    resolved = _endpoint_name_from_entity(self.hass, value)
                    if resolved is None:
                        self._errors[field] = "endpoint_not_found"
                    else:
                        user_input[field] = resolved

            trunk_value = user_input.get(CONF_SIP_TRUNK, "")
            if trunk_value and "." in trunk_value:
                resolved = _endpoint_name_from_entity(self.hass, trunk_value)
                if resolved is None:
                    self._errors[CONF_SIP_TRUNK] = "endpoint_not_found"
                else:
                    user_input[CONF_SIP_TRUNK] = f"PJSIP/{resolved}/"

            if not self._errors:
                self._data.update(user_input)
                return await self.async_step_init()

        data = self._data
        doorbell_default = (
            _entity_from_endpoint_name(self.hass, data.get(CONF_DOORBELL_EXTENSION, ""))
            or data.get(CONF_DOORBELL_EXTENSION, "")
        )
        internal_default = (
            _entity_from_endpoint_name(self.hass, data.get(CONF_INTERNAL_EXTENSION, ""))
            or data.get(CONF_INTERNAL_EXTENSION, "")
        )
        trunk_default = (
            _trunk_entity_from_value(self.hass, data.get(CONF_SIP_TRUNK, ""))
            or data.get(CONF_SIP_TRUNK, DEFAULT_SIP_TRUNK)
        )

        return self.async_show_form(
            step_id="sip_settings",
            data_schema=vol.Schema({
                vol.Required(CONF_DOORBELL_EXTENSION, default=doorbell_default): _ASTERISK_ENDPOINT_SELECTOR,
                vol.Required(CONF_INTERNAL_EXTENSION, default=internal_default): _ASTERISK_ENDPOINT_SELECTOR,
                vol.Required(CONF_SIP_TRUNK, default=trunk_default): _ASTERISK_ENDPOINT_SELECTOR,
                vol.Required(CONF_SIP_DOMAIN, default=data.get(CONF_SIP_DOMAIN, DEFAULT_SIP_DOMAIN)): str,
            }),
            errors=self._errors,
        )

    # ── Enabled Modes ─────────────────────────────────────────────────────────

    async def async_step_enabled_modes(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        if user_input is not None:
            selected = user_input.get(CONF_ENABLED_MODES, DOORBELL_MODES)
            # deactivated is always included
            if "deactivated" not in selected:
                selected = list(selected) + ["deactivated"]
            self._data[CONF_ENABLED_MODES] = selected
            # remove phone map entries for modes that are no longer enabled
            mode_map = dict(self._data.get(CONF_MODE_PHONE_MAP, {}))
            for mode in list(mode_map.keys()):
                if mode not in selected:
                    del mode_map[mode]
            self._data[CONF_MODE_PHONE_MAP] = mode_map
            return await self.async_step_init()

        current = self._data.get(CONF_ENABLED_MODES, DOORBELL_MODES)
        return self.async_show_form(
            step_id="enabled_modes",
            data_schema=vol.Schema({
                vol.Required(CONF_ENABLED_MODES, default=list(current)): SelectSelector(
                    SelectSelectorConfig(
                        options=DOORBELL_MODES,
                        multiple=True,
                        mode=SelectSelectorMode.LIST,
                        translation_key="doorbell_mode",
                    )
                ),
            }),
        )

    # ── Phone Numbers (mode picker) ───────────────────────────────────────────

    async def async_step_phone_numbers(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        """Show a menu of external modes to configure phone numbers for."""
        enabled = self._data.get(CONF_ENABLED_MODES, DOORBELL_MODES)
        external_enabled = [m for m in enabled if m in EXTERNAL_MODES]

        if not external_enabled:
            return await self.async_step_init()

        if user_input is not None:
            self._pending_mode = user_input.get("mode")
            return await self.async_step_phone_numbers_for_mode()

        return self.async_show_form(
            step_id="phone_numbers",
            data_schema=vol.Schema({
                vol.Required("mode", default=external_enabled[0]): SelectSelector(
                    SelectSelectorConfig(
                        options=external_enabled,
                        multiple=False,
                        mode=SelectSelectorMode.LIST,
                        translation_key="doorbell_mode",
                    )
                ),
            }),
        )

    async def async_step_phone_numbers_for_mode(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        """Configure phone number entities for a specific mode."""
        mode = self._pending_mode
        if mode is None:
            return await self.async_step_init()

        if user_input is not None:
            mode_map = dict(self._data.get(CONF_MODE_PHONE_MAP, {}))
            mode_map[mode] = user_input.get(CONF_MODE_PHONE_MAP, [])
            self._data[CONF_MODE_PHONE_MAP] = mode_map
            self._pending_mode = None
            return await self.async_step_init()

        current_entities = self._data.get(CONF_MODE_PHONE_MAP, {}).get(mode, [])
        return self.async_show_form(
            step_id="phone_numbers_for_mode",
            data_schema=vol.Schema({
                vol.Optional(CONF_MODE_PHONE_MAP, default=current_entities): _PHONE_ENTITIES_SELECTOR,
            }),
            description_placeholders={"mode": mode},
        )

    # ── Done ─────────────────────────────────────────────────────────────────

    async def async_step_done(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        return self.async_create_entry(title="", data=self._data)
