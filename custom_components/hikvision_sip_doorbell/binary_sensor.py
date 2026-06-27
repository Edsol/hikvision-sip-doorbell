"""Binary sensor platform — SIP client registration status."""

from __future__ import annotations

import logging

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory, STATE_ON
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_state_change_event

from .const import CONF_DEVICE_ID, CONF_INTERNAL_EXTENSION, DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    internal_ext = entry.data.get(CONF_INTERNAL_EXTENSION, "6002")
    async_add_entities([SipClientRegisteredSensor(hass, entry, internal_ext)])


class SipClientRegisteredSensor(BinarySensorEntity):
    """Mirrors the Asterisk 'binary_sensor.<ext>_registered' entity."""

    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_has_entity_name = True
    _attr_name = "SIP Client Connected"

    def __init__(
        self, hass: HomeAssistant, entry: ConfigEntry, extension: str
    ) -> None:
        self._hass = hass
        self._extension = extension
        # Asterisk integration names the entity binary_sensor.<ext>_registered
        self._source_entity_id = f"binary_sensor.{extension}_registered"
        device_id = entry.data[CONF_DEVICE_ID]
        self._attr_unique_id = f"{DOMAIN}_{device_id}_sip_client_connected"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device_id)},
            name="Hikvision SIP Doorbell",
            manufacturer="Hikvision",
            model=entry.data.get("model", "DS-KV6113-WPE1(C)"),
        )
        self._attr_icon = "mdi:webrtc"
        self._update_from_source()

    def _update_from_source(self) -> None:
        state = self._hass.states.get(self._source_entity_id)
        self._attr_is_on = state is not None and state.state == STATE_ON

    @property
    def extra_state_attributes(self) -> dict:
        return {"source_entity": self._source_entity_id}

    async def async_added_to_hass(self) -> None:
        self._update_from_source()

        @callback
        def _on_source_change(event) -> None:
            self._update_from_source()
            self.async_write_ha_state()

        self.async_on_remove(
            async_track_state_change_event(
                self.hass, [self._source_entity_id], _on_source_change
            )
        )
