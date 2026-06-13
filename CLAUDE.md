# CLAUDE.md — hikvision_sip_doorbell

Context file for AI assistants working on this codebase. Read this before making any changes.

---

## What this project is

A Home Assistant custom integration for the **Hikvision DS-KV6113-WPE1(C)** video doorbell (and compatible models). It bridges the [Hikvision Addons MQTT doorbell addon](https://github.com/pergolafabio/Hikvision-Addons/tree/main/doorbell) with an **Asterisk PBX** for flexible SIP call routing — without using the Hikvision app.

---

## Architecture overview

```
MQTT (Hikvision Addons addon)
  └── hikvision/<device_id>/call_state  →  coordinator._on_call_state()
  └── hikvision/<device_id>/contact     →  coordinator._on_contact()

coordinator._on_call_state():
  if call_state == "ringing":
    → async_create_task(_async_originate())
      → builds AMI Originate parameters from current mode + mode_map
      → hass.services.async_call("asterisk", "send_action", {Originate})

Asterisk AMI
  └── Originate → routes call to internal extension or external SIP trunk
```

---

## Platform files

| File | Entities | Notes |
|---|---|---|
| `coordinator.py` | — | Central state, MQTT subscriptions, AMI Originate, SIP discovery |
| `select.py` | `select.doorbell_mode` | at_home / away_from_home / vacation / deactivated |
| `sensor.py` | `sensor.call_state`, `sensor.number_to_call`, `sensor.active_contact` | Operational |
| `sensor.py` | `sensor.doorbell_extension`, `sensor.internal_extension`, `sensor.sip_trunk`, `sensor.sip_domain` | Diagnostic (EntityCategory.DIAGNOSTIC) |
| `button.py` | `button.discover_sip_domain` | Diagnostic — triggers manual SIP domain discovery |
| `config_flow.py` | — | 2-step wizard + options flow |

---

## Config entry data structure

```python
{
    "device_id": "myfrontdoor",            # MQTT topic prefix (extracted from MQTT entity)
    "doorbell_extension": "6001",          # SIP number of the doorbell panel (used in CallerID)
    "internal_extension": "6002",          # Asterisk PJSIP extension to ring indoors
    "sip_trunk": "PJSIP/my-trunk/",       # SIP trunk prefix for external calls
    "sip_domain": "sip.example.com",       # VoIP domain — auto-discovered via AMI on first run
    "mode_map": {                          # mode → input_text entity_id (external modes only)
        "away_from_home": "input_text.my_phone",
        "vacation": "input_text.my_phone",
    }
}
```

`sip_domain` starts as the placeholder `sip.example.com` and is auto-updated by `_async_discover_sip_domain()` on first coordinator setup, or on demand via the `Discover SIP Domain` button.

---

## Config flow

**Step 1 — Device settings** (all via EntitySelector, no free-text except sip_domain):

| Field | Selector | How resolved |
|---|---|---|
| `device_id` | MQTT sensor (integration: mqtt, domain: sensor) | `_device_id_from_mqtt_entity()`: strips known suffix from unique_id (e.g. `videocitofono_call_state` → `videocitofono`) |
| `doorbell_extension` | Asterisk binary_sensor (integration: asterisk, domain: binary_sensor) | `_endpoint_name_from_entity()`: reads device.name from device registry (e.g. `PJSIP/6001` → `6001`) |
| `internal_extension` | same | same |
| `sip_trunk` | same | same, result prefixed as `PJSIP/<name>/` |
| `sip_domain` | Free text | Default `sip.example.com` — auto-discovered post-setup |

**Step 2 — Phone numbers**: EntitySelector (domain: input_text) for each external mode (away_from_home, vacation).

**Options flow**: edits all fields from step 1 + mode_map.

---

## MQTT topics

| Topic | Values | Action |
|---|---|---|
| `hikvision/<device_id>/call_state` | idle / ringing / answered / dismissed | Triggers AMI Originate on `ringing` |
| `hikvision/<device_id>/contact` | contact name string | Updates `sensor.active_contact` (informational only) |

---

## Call routing

Defined in `const.py → DIAL_ROUTE`:

| Mode | Route | AMI Channel built |
|---|---|---|
| `at_home` | internal | `PJSIP/<internal_extension>` |
| `away_from_home` | external | `<sip_trunk>sip:<phone>@<sip_domain>` |
| `vacation` | external | same as away_from_home |
| `deactivated` | none | no Originate — doorbell rings unanswered |

If external mode has no phone number in mode_map (or the input_text is empty), falls back to internal.

AMI Originate parameters:
```python
{
    "Channel":  "PJSIP/6002"  # or "PJSIP/my-trunk/sip:+391234567890@voip.example.com"
    "Context":  "from-door"
    "Exten":    "6002"         # always the internal extension
    "Priority": "1"
    "Timeout":  "30000"
    "CallerID": "Doorbell <6001>"
    "Async":    "true"
}
```

---

## SIP domain auto-discovery

`coordinator._async_discover_sip_domain(force=False)`:

1. Triggered automatically at coordinator setup **only if** `sip_domain == DEFAULT_SIP_DOMAIN` (`sip.example.com`)
2. Also triggered manually via `button.discover_sip_domain` (always runs, `force=True`)
3. Waits up to 15 seconds for `hass.data["asterisk"]` to be populated
4. Uses the Asterisk integration's AMI client directly (`hass.data["asterisk"][entry_id]["client"]`)
5. Sends `PJSIPShowEndpoint <trunk_name>` → listens for `EndpointDetail` event
6. Extracts `FromDomain` field from the event
7. Persists to config entry via `async_update_entry` → survives restarts
8. Calls `async_update_listeners()` → `sensor.sip_domain` updates immediately in UI

The AMI client is accessed directly (not via `asterisk.send_action` service) because `send_action` is fire-and-forget and cannot return event data.

---

## Persistence

`coordinator.py` uses `homeassistant.helpers.storage.Store` to persist `mode` and `active_contact` across HA restarts. Storage key: `hikvision_sip_doorbell_<entry_id>`.

`sip_domain` is persisted directly in the config entry data via `async_update_entry`.

---

## Adding a new operating mode

1. Add the mode string to `DOORBELL_MODES` in `const.py`
2. Add its routing entry to `DIAL_ROUTE` in `const.py`
3. If it needs an external phone number, add it to `EXTERNAL_MODES` — this automatically adds it to the config flow step 2 and options flow
4. Update translations if needed

---

## File map

```
const.py        ← modes, dial routes, config entry keys, AMI/SIP defaults
coordinator.py  ← MQTT subscriptions, AMI Originate, SIP discovery, persistence
config_flow.py  ← 2-step setup wizard + options flow, entity resolution helpers
select.py       ← select.doorbell_mode entity
sensor.py       ← operational + diagnostic sensor entities
button.py       ← button.discover_sip_domain entity
strings.json    ← translation source of truth (always update this first)
translations/   ← en.json, it.json (keep in sync with strings.json)
```
