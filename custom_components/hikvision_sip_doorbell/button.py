"""Button platform — manual actions for the Hikvision SIP Doorbell."""

from __future__ import annotations

import asyncio
import logging

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import CONF_DEVICE_ID, DOMAIN
from .coordinator import DoorbellCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: DoorbellCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([
        DiscoverSipDomainButton(coordinator, entry),
        SimulateRingButton(coordinator, entry),
        SyncRoutingDbButton(coordinator, entry),
    ])


class DiscoverSipDomainButton(ButtonEntity):
    """Button to trigger SIP domain auto-discovery from Asterisk."""

    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_icon = "mdi:magnify"
    _attr_name = "Discover SIP Domain"

    def __init__(self, coordinator: DoorbellCoordinator, entry: ConfigEntry) -> None:
        device_id = entry.data[CONF_DEVICE_ID]
        self._coordinator = coordinator
        self._attr_unique_id = f"{DOMAIN}_{device_id}_discover_sip_domain"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device_id)},
            name="Hikvision SIP Doorbell",
            manufacturer="Hikvision",
            model=entry.data.get("model", "DS-KV6113-WPE1(C)"),
        )

    async def async_press(self) -> None:
        # Force re-discovery even if domain was already set
        await self._coordinator._async_discover_sip_domain(force=True)


class SimulateRingButton(ButtonEntity):
    """Button to simulate a doorbell ring — updates call_state sensor for UI testing."""

    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_icon = "mdi:doorbell"
    _attr_name = "Simulate Ring"

    def __init__(self, coordinator: DoorbellCoordinator, entry: ConfigEntry) -> None:
        device_id = entry.data[CONF_DEVICE_ID]
        self._coordinator = coordinator
        self._attr_unique_id = f"{DOMAIN}_{device_id}_simulate_ring"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device_id)},
            name="Hikvision SIP Doorbell",
            manufacturer="Hikvision",
            model=entry.data.get("model", "DS-KV6113-WPE1(C)"),
        )

    async def async_press(self) -> None:
        _LOGGER.info("Simulate ring triggered manually")
        self._coordinator.call_state = "ringing"
        self._coordinator.async_update_listeners()
        await asyncio.sleep(2)
        self._coordinator.call_state = "idle"
        self._coordinator.async_update_listeners()


class SyncRoutingDbButton(ButtonEntity):
    """Button to manually write current routing to Asterisk AstDB."""

    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_icon = "mdi:database-sync"
    _attr_name = "Sync Routing to Asterisk"

    def __init__(self, coordinator: DoorbellCoordinator, entry: ConfigEntry) -> None:
        device_id = entry.data[CONF_DEVICE_ID]
        self._coordinator = coordinator
        self._attr_unique_id = f"{DOMAIN}_{device_id}_sync_routing_db"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device_id)},
            name="Hikvision SIP Doorbell",
            manufacturer="Hikvision",
            model=entry.data.get("model", "DS-KV6113-WPE1(C)"),
        )

    async def async_press(self) -> None:
        _LOGGER.info("Manual AstDB routing sync triggered")
        await self._coordinator._async_write_routing_db()
