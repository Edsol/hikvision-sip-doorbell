"""Select platform — doorbell operating mode and internal fallback."""

from __future__ import annotations

import logging

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from homeassistant.helpers import entity_registry as er

from .const import (
    CONF_DEVICE_ID,
    DEFAULT_INTERNAL_FALLBACK,
    DOMAIN,
    DOORBELL_MODES,
    INTERNAL_FALLBACK_OPTIONS,
    SUFFIX_MODE,
    EXTERNAL_MODES,
)
from .coordinator import DoorbellCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: DoorbellCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([
        DoorbellModeSelect(coordinator, entry),
        InternalFallbackSelect(coordinator, entry),
        NumberToCallSelect(coordinator, entry),
    ])


class DoorbellModeSelect(CoordinatorEntity, SelectEntity):
    """Select entity representing the doorbell operating mode."""

    _attr_icon = "mdi:doorbell-video"
    _attr_translation_key = "doorbell_mode"

    def __init__(self, coordinator: DoorbellCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        device_id = entry.data[CONF_DEVICE_ID]
        self._attr_unique_id = f"{DOMAIN}_{device_id}_{SUFFIX_MODE}"
        self._attr_name = "Doorbell Mode"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device_id)},
            name="Hikvision Doorbell",
            manufacturer="Hikvision",
            model=entry.data.get("model", "DS-KV6113-WPE1(C)"),
        )

    @property
    def options(self) -> list[str]:
        return self.coordinator.enabled_modes

    @property
    def current_option(self) -> str:
        return self.coordinator.mode

    async def async_select_option(self, option: str) -> None:
        await self.coordinator.async_set_mode(option)

    @callback
    def _handle_coordinator_update(self) -> None:
        self.async_write_ha_state()


class InternalFallbackSelect(CoordinatorEntity, SelectEntity):
    """Select entity for the fallback behaviour when the indoor extension is unreachable."""

    _attr_icon = "mdi:phone-missed"
    _attr_options = INTERNAL_FALLBACK_OPTIONS
    _attr_entity_category = EntityCategory.CONFIG
    _attr_translation_key = "internal_fallback"

    def __init__(self, coordinator: DoorbellCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        device_id = entry.data[CONF_DEVICE_ID]
        self._attr_unique_id = f"{DOMAIN}_{device_id}_internal_fallback"
        self._attr_name = "Internal Fallback"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device_id)},
            name="Hikvision Doorbell",
            manufacturer="Hikvision",
            model=entry.data.get("model", "DS-KV6113-WPE1(C)"),
        )

    @property
    def current_option(self) -> str:
        return self.coordinator.internal_fallback

    async def async_select_option(self, option: str) -> None:
        await self.coordinator.async_set_internal_fallback(option)

    @callback
    def _handle_coordinator_update(self) -> None:
        self.async_write_ha_state()


class NumberToCallSelect(CoordinatorEntity, SelectEntity):
    """Select entity for choosing which phone number to call for the current mode.

    Only visible when the current mode has multiple phone numbers configured.
    Hidden (unavailable) for internal-only modes (at_home, deactivated).
    """

    _attr_icon = "mdi:phone"
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(self, coordinator: DoorbellCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        device_id = entry.data[CONF_DEVICE_ID]
        self._attr_unique_id = f"{DOMAIN}_{device_id}_number_to_call"
        self._attr_name = "Number to Call"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device_id)},
            name="Hikvision Doorbell",
            manufacturer="Hikvision",
            model=entry.data.get("model", "DS-KV6113-WPE1(C)"),
        )

    @property
    def available(self) -> bool:
        """Only available when the current mode has phone numbers configured."""
        return (
            self.coordinator.mode in EXTERNAL_MODES
            and len(self.coordinator.phone_entities_for_mode(self.coordinator.mode)) > 0
        )

    @property
    def options(self) -> list[str]:
        return self.coordinator.phone_entities_for_mode(self.coordinator.mode)

    @property
    def current_option(self) -> str | None:
        sel = self.coordinator.selected_phone_entity
        opts = self.coordinator.phone_entities_for_mode(self.coordinator.mode)
        return sel if sel in opts else (opts[0] if opts else None)

    async def async_select_option(self, option: str) -> None:
        await self.coordinator.async_set_selected_phone_entity(option)

    @callback
    def _handle_coordinator_update(self) -> None:
        self.async_write_ha_state()
