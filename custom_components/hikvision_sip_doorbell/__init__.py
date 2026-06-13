"""Hikvision Doorbell — Home Assistant custom integration.

Manages a Hikvision DS-KV6113 (or compatible) video doorbell connected via
the Hikvision Addons MQTT bridge and Asterisk for SIP call routing.

Entities created:
  select.doorbell_mode      — at_home / away_from_home / vacation / deactivated
  sensor.number_to_call     — phone number for the active contact
  sensor.dial_string        — JSON routing payload consumed by Asterisk dialplan
"""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady

from .const import CONF_INTERNAL_EXTENSION, CONF_SIP_TRUNK, DOMAIN, PLATFORMS
from .coordinator import DoorbellCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Hikvision Doorbell from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    coordinator = DoorbellCoordinator(hass, entry)

    try:
        await coordinator.async_setup()
    except Exception as exc:
        raise ConfigEntryNotReady(f"Could not set up doorbell: {exc}") from exc

    hass.data[DOMAIN][entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    coordinator: DoorbellCoordinator | None = hass.data.get(DOMAIN, {}).get(
        entry.entry_id
    )
    if coordinator:
        await coordinator.async_unload()

    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unloaded


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Merge options back into entry data and reload."""
    # Options flow stores updated fields; merge them into the main data dict
    # so that coordinator.update_entry_data() and a reload see the new values.
    if entry.options:
        new_data = {**entry.data, **entry.options}
        hass.config_entries.async_update_entry(entry, data=new_data, options={})
    await hass.config_entries.async_reload(entry.entry_id)
