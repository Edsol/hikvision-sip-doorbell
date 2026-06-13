"""Sensor platform — operational sensors + diagnostic configuration sensors."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Callable

from homeassistant.components.sensor import SensorEntity, SensorEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    CONF_DEVICE_ID,
    DOMAIN,
)
from .coordinator import DoorbellCoordinator

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class DoorbellSensorDescription(SensorEntityDescription):
    value_fn: Callable[[DoorbellCoordinator], str] = lambda c: ""
    entity_category: EntityCategory | None = None


# ── Operational sensors ───────────────────────────────────────────────────────

SENSOR_DESCRIPTIONS: tuple[DoorbellSensorDescription, ...] = (
    DoorbellSensorDescription(
        key="call_state",
        name="Call State",
        icon="mdi:phone-ring",
        value_fn=lambda c: c.call_state,
    ),
)

# ── Diagnostic sensors (config values, read-only) ─────────────────────────────

DIAGNOSTIC_DESCRIPTIONS: tuple[DoorbellSensorDescription, ...] = (
    DoorbellSensorDescription(
        key="diag_doorbell_extension",
        name="Doorbell Extension",
        icon="mdi:numeric",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda c: c.doorbell_ext,
    ),
    DoorbellSensorDescription(
        key="diag_internal_extension",
        name="Internal Extension",
        icon="mdi:numeric",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda c: c.internal_ext,
    ),
    DoorbellSensorDescription(
        key="diag_sip_trunk",
        name="SIP Trunk",
        icon="mdi:phone-outgoing",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda c: c.sip_trunk,
    ),
    DoorbellSensorDescription(
        key="diag_sip_domain",
        name="SIP Domain",
        icon="mdi:web",
        entity_category=EntityCategory.DIAGNOSTIC,
        value_fn=lambda c: c.sip_domain,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: DoorbellCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        [
            DoorbellSensor(coordinator, entry, desc)
            for desc in (*SENSOR_DESCRIPTIONS, *DIAGNOSTIC_DESCRIPTIONS)
        ] + [BehaviorSummarySensor(coordinator, entry)]
    )


class DoorbellSensor(CoordinatorEntity, SensorEntity):
    """Read-only sensor derived from coordinator state."""

    entity_description: DoorbellSensorDescription

    def __init__(
        self,
        coordinator: DoorbellCoordinator,
        entry: ConfigEntry,
        description: DoorbellSensorDescription,
    ) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        device_id = entry.data[CONF_DEVICE_ID]
        self._attr_unique_id = f"{DOMAIN}_{device_id}_{description.key}"
        self._attr_name = description.name
        self._attr_entity_category = description.entity_category
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device_id)},
            name="Hikvision SIP Doorbell",
            manufacturer="Hikvision",
            model=entry.data.get("model", "DS-KV6113-WPE1(C)"),
        )

    @property
    def native_value(self) -> str:
        return self.entity_description.value_fn(self.coordinator)

    @callback
    def _handle_coordinator_update(self) -> None:
        self.async_write_ha_state()


class BehaviorSummarySensor(CoordinatorEntity, SensorEntity):
    """Diagnostic sensor showing a translated description of current routing behaviour."""

    _attr_icon = "mdi:information-outline"
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_name = "Behavior Summary"

    def __init__(self, coordinator: DoorbellCoordinator, entry: ConfigEntry) -> None:
        super().__init__(coordinator)
        device_id = entry.data[CONF_DEVICE_ID]
        self._attr_unique_id = f"{DOMAIN}_{device_id}_diag_behavior_summary"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device_id)},
            name="Hikvision SIP Doorbell",
            manufacturer="Hikvision",
            model=entry.data.get("model", "DS-KV6113-WPE1(C)"),
        )

    @property
    def native_value(self) -> str:
        key, _ = self.coordinator.behavior_summary
        return key

    @property
    def translation_key(self) -> str:
        key, _ = self.coordinator.behavior_summary
        return f"behavior_{key}"

    @property
    def translation_placeholders(self) -> dict:
        _, placeholders = self.coordinator.behavior_summary
        return placeholders

    @callback
    def _handle_coordinator_update(self) -> None:
        self.async_write_ha_state()
