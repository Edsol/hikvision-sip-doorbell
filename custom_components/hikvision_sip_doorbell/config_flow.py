"""Config flow for Hikvision SIP Doorbell integration."""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.components.mqtt import async_subscribe
from homeassistant.core import callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.selector import (
    EntityFilterSelectorConfig,
    EntitySelector,
    EntitySelectorConfig,
)

from .const import (
    CONF_CALL_STATE_ENTITY,
    CONF_DEVICE_ID,
    CONF_DOORBELL_EXTENSION,
    CONF_INTERNAL_EXTENSION,
    CONF_INTERNAL_FALLBACK,
    CONF_MODE_MAP,
    CONF_SIP_DOMAIN,
    CONF_SIP_TRUNK,
    DEFAULT_INTERNAL_FALLBACK,
    DEFAULT_SIP_DOMAIN,
    DEFAULT_SIP_TRUNK,
    DOMAIN,
    EXTERNAL_MODES,
    INTERNAL_FALLBACK_OPTIONS,
)

_LOGGER = logging.getLogger(__name__)

# Selects sensor entities from the MQTT integration (Hikvision Addons publishes sensors)
_MQTT_SENSOR_SELECTOR = EntitySelector(
    EntitySelectorConfig(
        filter=EntityFilterSelectorConfig(integration="mqtt", domain="sensor"),
        multiple=False,
    )
)

# Selects binary_sensor entities from the Asterisk integration (PJSIP registered sensors)
_ASTERISK_ENDPOINT_SELECTOR = EntitySelector(
    EntitySelectorConfig(
        filter=EntityFilterSelectorConfig(integration="asterisk", domain="binary_sensor"),
        multiple=False,
    )
)

_PHONE_ENTITY_SELECTOR = EntitySelector(EntitySelectorConfig(domain="input_text"))

from homeassistant.helpers.selector import SelectSelector, SelectSelectorConfig, SelectSelectorMode

def _fallback_selector(default: str = DEFAULT_INTERNAL_FALLBACK) -> SelectSelector:
    return SelectSelector(
        SelectSelectorConfig(
            options=INTERNAL_FALLBACK_OPTIONS,
            mode=SelectSelectorMode.LIST,
            translation_key="internal_fallback",
        )
    )


def _entity_from_endpoint_name(hass, name: str) -> str | None:
    """Reverse lookup: given an endpoint name (e.g. '6001'), find the Asterisk entity_id.

    Searches for a binary_sensor from the Asterisk integration whose device name
    ends with '/<name>' (e.g. 'PJSIP/6001').
    """
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
        # Match "PJSIP/6001" → "6001", or "PJSIP/iliad-trunk/" → strip prefix
        part = dev_name.split("/", 1)[-1].rstrip("/") if "/" in dev_name else dev_name
        if part == name or dev_name == name:
            return entry.entity_id
    return None


def _trunk_entity_from_value(hass, trunk_value: str) -> str | None:
    """Reverse lookup for trunk: 'PJSIP/iliad-trunk/' → entity_id."""
    # Extract the trunk name from stored value like "PJSIP/iliad-trunk/"
    name = trunk_value.rstrip("/").split("/")[-1] if "/" in trunk_value else trunk_value
    return _entity_from_endpoint_name(hass, name)


def _endpoint_name_from_entity(hass, entity_id: str) -> str | None:
    """Resolve a PJSIP endpoint name from an Asterisk binary_sensor entity.

    The Asterisk integration sets device_info.name = "PJSIP/<extension>".
    Returns None if the device cannot be found or name has unexpected format.
    """
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)

    entry = ent_reg.async_get(entity_id)
    if entry is None or entry.device_id is None:
        return None

    device = dev_reg.async_get(entry.device_id)
    if device is None:
        return None

    # device.name is e.g. "PJSIP/6001" or "SIP/iliad-trunk"
    name: str = device.name or ""
    if "/" in name:
        return name.split("/", 1)[1]
    return name or None


def _device_id_from_mqtt_entity(hass, entity_id: str) -> str | None:
    """Extract the Hikvision MQTT device_id from a sensor entity.

    The Hikvision Addons addon creates MQTT entities whose unique_id follows
    the pattern: "<device_id>_<suffix>" (e.g. "videocitofono_call_state").
    The device_id is the segment of the MQTT topic: hikvision/<device_id>/...

    We derive it by looking at the entity unique_id and stripping known suffixes,
    or by matching the MQTT state_topic stored in entity platform data.

    Falls back to deriving from the entity's device name if unique_id parsing fails.
    """
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)

    entry = ent_reg.async_get(entity_id)
    if entry is None:
        return None

    # Strategy 1: unique_id ends with a known Hikvision suffix → strip it
    known_suffixes = [
        "_call_state", "_call_status", "_contact", "_caller_info",
        "_door_1_relay", "_backlight_mode", "_isapi_request",
    ]
    uid: str = entry.unique_id or ""
    for suffix in known_suffixes:
        if uid.endswith(suffix):
            return uid[: -len(suffix)]

    # Strategy 2: use the device name (lowercased, spaces→underscores)
    if entry.device_id:
        device = dev_reg.async_get(entry.device_id)
        if device and device.name:
            return device.name.lower().replace(" ", "_")

    # Strategy 3: first segment of entity object_id before first underscore
    # (least reliable, last resort)
    object_id = entity_id.split(".", 1)[-1]
    return object_id.split("_")[0] if "_" in object_id else None


class HikvisionSipDoorbellConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Two-step config flow: device settings → mode phone mapping."""

    VERSION = 1

    def __init__(self) -> None:
        self._data: dict[str, Any] = {}
        self._errors: dict[str, str] = {}

    # ── Step 1: device + SIP ──────────────────────────────────────────────────

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        self._errors = {}

        if user_input is not None:
            # Resolve MQTT device_id from Hikvision sensor entity; also save the entity_id itself
            mqtt_entity = user_input.get(CONF_DEVICE_ID, "")
            if mqtt_entity:
                resolved = _device_id_from_mqtt_entity(self.hass, mqtt_entity)
                if resolved is None:
                    self._errors[CONF_DEVICE_ID] = "device_id_not_found"
                else:
                    user_input[CONF_CALL_STATE_ENTITY] = mqtt_entity  # save original entity_id
                    user_input[CONF_DEVICE_ID] = resolved

            # Resolve doorbell extension from Asterisk entity
            doorbell_entity = user_input.get(CONF_DOORBELL_EXTENSION, "")
            if doorbell_entity:
                resolved = _endpoint_name_from_entity(self.hass, doorbell_entity)
                if resolved is None:
                    self._errors[CONF_DOORBELL_EXTENSION] = "endpoint_not_found"
                else:
                    user_input[CONF_DOORBELL_EXTENSION] = resolved

            # Resolve internal extension from Asterisk entity
            internal_entity = user_input.get(CONF_INTERNAL_EXTENSION, "")
            if internal_entity:
                resolved = _endpoint_name_from_entity(self.hass, internal_entity)
                if resolved is None:
                    self._errors[CONF_INTERNAL_EXTENSION] = "endpoint_not_found"
                else:
                    user_input[CONF_INTERNAL_EXTENSION] = resolved

            # Resolve SIP trunk from Asterisk entity → store as "PJSIP/<name>/"
            trunk_entity = user_input.get(CONF_SIP_TRUNK, "")
            if trunk_entity:
                resolved = _endpoint_name_from_entity(self.hass, trunk_entity)
                if resolved is None:
                    self._errors[CONF_SIP_TRUNK] = "endpoint_not_found"
                else:
                    user_input[CONF_SIP_TRUNK] = f"PJSIP/{resolved}/"

            if not self._errors:
                device_id = user_input[CONF_DEVICE_ID]
                await self.async_set_unique_id(device_id)
                self._abort_if_unique_id_configured()
                self._data.update(user_input)
                return await self.async_step_mode_map()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_DEVICE_ID): _MQTT_SENSOR_SELECTOR,
                    vol.Required(CONF_DOORBELL_EXTENSION): _ASTERISK_ENDPOINT_SELECTOR,
                    vol.Required(CONF_INTERNAL_EXTENSION): _ASTERISK_ENDPOINT_SELECTOR,
                    vol.Required(CONF_SIP_TRUNK): _ASTERISK_ENDPOINT_SELECTOR,
                    vol.Required(CONF_SIP_DOMAIN, default=DEFAULT_SIP_DOMAIN): str,
                }
            ),
            errors=self._errors,
        )

    # ── Step 2: mode → phone entity mapping ───────────────────────────────────

    async def async_step_mode_map(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        """One entity selector per external mode."""
        if user_input is not None:
            mode_map = {
                mode: entity
                for mode in EXTERNAL_MODES
                if (entity := user_input.get(mode, "").strip())
            }
            self._data[CONF_MODE_MAP] = mode_map
            return self.async_create_entry(
                title=f"Doorbell ({self._data[CONF_DEVICE_ID]})",
                data=self._data,
            )

        schema = vol.Schema(
            {vol.Optional(mode): _PHONE_ENTITY_SELECTOR for mode in sorted(EXTERNAL_MODES)}
        )
        return self.async_show_form(step_id="mode_map", data_schema=schema)

    # ── Options flow ──────────────────────────────────────────────────────────

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> HikvisionSipDoorbellOptionsFlow:
        return HikvisionSipDoorbellOptionsFlow(config_entry)


class HikvisionSipDoorbellOptionsFlow(config_entries.OptionsFlow):
    """Options: edit SIP settings and mode phone mapping."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        self._entry = config_entry
        self._errors: dict[str, str] = {}

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.FlowResult:
        data = self._entry.data
        self._errors = {}

        if user_input is not None:
            # Resolve Asterisk entity selectors → extension/trunk names
            # Values are entity_ids when user picks from selector, plain strings otherwise
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
                mode_map = {
                    mode: entity
                    for mode in EXTERNAL_MODES
                    if (entity := user_input.pop(mode, "").strip())
                }
                return self.async_create_entry(
                    title="",
                    data={
                        CONF_DOORBELL_EXTENSION: user_input[CONF_DOORBELL_EXTENSION],
                        CONF_INTERNAL_EXTENSION: user_input[CONF_INTERNAL_EXTENSION],
                        CONF_SIP_TRUNK: user_input[CONF_SIP_TRUNK],
                        CONF_SIP_DOMAIN: user_input[CONF_SIP_DOMAIN],
                        CONF_MODE_MAP: mode_map,
                    },
                )

        current_mode_map: dict[str, str] = data.get(CONF_MODE_MAP, {})

        # Resolve stored extension names back to entity_ids for the selectors
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

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_DOORBELL_EXTENSION,
                    default=doorbell_default,
                ): _ASTERISK_ENDPOINT_SELECTOR,
                vol.Required(
                    CONF_INTERNAL_EXTENSION,
                    default=internal_default,
                ): _ASTERISK_ENDPOINT_SELECTOR,
                vol.Required(
                    CONF_SIP_TRUNK,
                    default=trunk_default,
                ): _ASTERISK_ENDPOINT_SELECTOR,
                vol.Required(
                    CONF_SIP_DOMAIN,
                    default=data.get(CONF_SIP_DOMAIN, DEFAULT_SIP_DOMAIN),
                ): str,
                **{
                    vol.Optional(mode, default=current_mode_map.get(mode, "")): _PHONE_ENTITY_SELECTOR
                    for mode in sorted(EXTERNAL_MODES)
                },
            }
        )
        return self.async_show_form(
            step_id="init",
            data_schema=schema,
            errors=self._errors,
        )
