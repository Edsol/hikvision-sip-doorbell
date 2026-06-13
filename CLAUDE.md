# CLAUDE.md — hikvision_sip_doorbell

Context file for AI assistants working on this codebase. Read this before making any changes.

---

## What this project is

A Home Assistant custom integration for the **Hikvision DS-KV6113-WPE1(C)** video doorbell (and compatible models). It bridges the [Hikvision Addons MQTT doorbell addon](https://github.com/pergolafabio/Hikvision-Addons/tree/main/doorbell) with an **Asterisk PBX** for flexible SIP call routing — without using the Hikvision app.

---

## Architecture overview

```
Hikvision Addons MQTT addon
  └── publishes sensor state to HA (e.g. sensor.videocitofono_call_state)

coordinator._async_subscribe_call_state()
  └── async_track_state_change_event on the MQTT sensor entity
        if new state == "ringing":
          → async_create_task(_async_originate())
            → builds AMI Originate parameters from current mode + selected phone entity
            → hass.services.async_call("asterisk", "send_action", {Originate})

Asterisk AMI
  └── Originate → routes call to internal extension or external SIP trunk
```

Call state is tracked via `async_track_state_change_event` on the existing HA MQTT sensor entity — **not** via direct MQTT subscription. This avoids MQTT topic guessing and unique_id collisions.

---

## Platform files

| File | Entities | Notes |
|---|---|---|
| `coordinator.py` | — | Central state, call state tracking, AMI Originate, SIP discovery, persistence |
| `select.py` | `select.doorbell_mode` | at_home / away_from_home / vacation / deactivated |
| `select.py` | `select.internal_fallback` | wait / call_external / none — `EntityCategory.CONFIG` |
| `select.py` | `select.number_to_call` | friendly names of configured input_text entities — `EntityCategory.CONFIG` |
| `sensor.py` | `sensor.call_state` | Operational — idle / ringing / answered / dismissed |
| `sensor.py` | `sensor.doorbell_extension`, `sensor.internal_extension`, `sensor.sip_trunk`, `sensor.sip_domain` | `EntityCategory.DIAGNOSTIC` |
| `sensor.py` | `sensor.behavior_summary` | `EntityCategory.DIAGNOSTIC` — human-readable description of current routing behaviour |
| `button.py` | `button.discover_sip_domain` | `EntityCategory.DIAGNOSTIC` — manual SIP domain re-discovery |
| `button.py` | `button.simulate_ring` | `EntityCategory.DIAGNOSTIC` — triggers `_async_originate()` without a real doorbell press |
| `config_flow.py` | — | Single-step config flow + menu-driven options flow |

---

## Config entry data structure

```python
{
    "device_id": "myfrontdoor",              # MQTT topic prefix (extracted from MQTT sensor entity)
    "call_state_entity": "sensor.myfrontdoor_call_state",  # HA entity to track
    "doorbell_extension": "6001",            # SIP number of the doorbell panel (CallerID)
    "internal_extension": "6002",            # Asterisk PJSIP extension to ring indoors
    "sip_trunk": "PJSIP/my-trunk/",         # SIP trunk prefix for external calls
    "sip_domain": "sip.example.com",         # VoIP domain — auto-discovered via AMI on first run
    "phone_entities": [                      # list of input_text entity_ids for external calls
        "input_text.my_phone",
    ]
}
```

`sip_domain` starts as the placeholder `sip.example.com` and is auto-updated by `_async_discover_sip_domain()` on first coordinator setup, or on demand via the `Discover SIP Domain` button.

---

## Config flow

**Config step — Device settings** (all via EntitySelector, no free-text except sip_domain):

| Field | Selector | How resolved |
|---|---|---|
| `device_id` / `call_state_entity` | MQTT sensor (integration: mqtt, domain: sensor) | `_device_id_from_mqtt_entity()`: strips known suffix from unique_id; `call_state_entity` = original entity_id |
| `doorbell_extension` | Asterisk binary_sensor (integration: asterisk, domain: binary_sensor) | `_endpoint_name_from_entity()`: reads device.name from device registry (e.g. `PJSIP/6001` → `6001`) |
| `internal_extension` | same | same |
| `sip_trunk` | same | same, result stored as `PJSIP/<name>/` |
| `sip_domain` | Free text | Default `sip.example.com` — auto-discovered post-setup |

**Options flow** — menu-driven (`async_show_menu`):
- **SIP Settings**: edit doorbell/internal ext, trunk, domain
- **Phone Numbers**: multi-select EntitySelector (domain: input_text) → saved as `CONF_PHONE_ENTITIES` list
- **Save & Close**: writes updated data to config entry

---

## Runtime entities

### select.number_to_call
- Options: **friendly names** of the `input_text` entities configured in the options flow
- Stored internally as `entity_id` (e.g. `input_text.my_phone`); coordinator resolves friendly name ↔ entity_id
- Reading the phone number: `coordinator.number_to_call` reads `hass.states.get(entity_id).state`
- Persistence: selected entity_id is saved in Store

### select.internal_fallback
Applies only when `mode=at_home` and the indoor extension is not registered in Asterisk:
- `wait` — send Originate anyway, dialplan `Wait(25)` keeps the channel open
- `call_external` — route to external number via SIP trunk (uses `number_to_call`)
- `none` — ignore the ring entirely

### sensor.behavior_summary
Human-readable string updated on every coordinator state change. Examples:
- `"Will ring indoor extension 6002."`
- `"Indoor extension 6002 is not registered. Will ring anyway and wait 25s."`
- `"Will call external number +391234567890 (My Phone) via SIP trunk."`
- `"Doorbell is deactivated — calls will be ignored."`

---

## MQTT / call state tracking

| HA entity | Values | Action |
|---|---|---|
| `sensor.<device_id>_call_state` (or configured entity) | idle / ringing / answered / dismissed | Triggers AMI Originate on `ringing` |

The coordinator does **not** subscribe to MQTT directly. It uses `async_track_state_change_event` on the existing MQTT sensor entity.

---

## Call routing

Defined in `const.py → DIAL_ROUTE`:

| Mode | Route | AMI Channel built |
|---|---|---|
| `at_home` | internal | `PJSIP/<internal_extension>` |
| `away_from_home` | external | `<sip_trunk>sip:<phone>@<sip_domain>` |
| `vacation` | external | same as away_from_home |
| `deactivated` | none | no Originate |

If external mode has no phone number configured (or the input_text is empty/unavailable), falls back to internal extension with a warning log.

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
2. Also triggered manually via `button.discover_sip_domain` (`force=True`)
3. Waits up to 15 seconds for `hass.data["asterisk"]` to be populated
4. Uses the Asterisk integration's AMI client directly (`hass.data["asterisk"][entry_id]["client"]`)
5. Sends `PJSIPShowEndpoint <trunk_name>` → listens for `EndpointDetail` event
6. Extracts `FromDomain` field → persists to config entry via `async_update_entry`

The AMI client is accessed directly (not via `asterisk.send_action`) because `send_action` is fire-and-forget and cannot return event data.

---

## Persistence

`coordinator.py` uses `homeassistant.helpers.storage.Store` to persist across restarts:
- `mode`
- `internal_fallback`
- `selected_phone_entity` (entity_id, not friendly name)

Storage key: `hikvision_sip_doorbell_<entry_id>`.

`sip_domain` is persisted in config entry data via `async_update_entry`.

---

## Entity unique_id convention

All unique_ids are prefixed with `{DOMAIN}_{device_id}_` to avoid collisions with MQTT entities that share the same device_id namespace. Example: `hikvision_sip_doorbell_myfrontdoor_call_state`.

---

## Translations — keep always in sync

**Rule: whenever you add or change a user-visible string (entity name, select option, sensor state, config/options flow label), update all three files before finishing:**

```
strings.json              ← source of truth, English
translations/en.json      ← identical to strings.json
translations/it.json      ← Italian translation
```

Translations cover:
- `config.step.*` — config flow labels
- `options.step.*` — options flow labels (including `menu_options` for `async_show_menu` steps)
- `entity.select.<translation_key>.state.*` — select entity option labels (requires `_attr_translation_key` on the entity class)

Select entities with translated options:
- `DoorbellModeSelect` → `_attr_translation_key = "doorbell_mode"`
- `InternalFallbackSelect` → `_attr_translation_key = "internal_fallback"`

---

## Adding a new operating mode

1. Add the mode string to `DOORBELL_MODES` in `const.py`
2. Add its routing entry to `DIAL_ROUTE` in `const.py`
3. If it needs an external phone number, add it to `EXTERNAL_MODES`
4. Update `entity.select.doorbell_mode.state` in all three translation files

---

## File map

```
const.py        ← modes, dial routes, config entry keys, AMI/SIP defaults
coordinator.py  ← call state tracking, AMI Originate, SIP discovery, persistence, behavior_summary
config_flow.py  ← config flow + menu-driven options flow, entity resolution helpers
select.py       ← DoorbellModeSelect, InternalFallbackSelect, NumberToCallSelect
sensor.py       ← call_state (operational) + diagnostic sensors + behavior_summary sensor
button.py       ← DiscoverSipDomainButton, SimulateRingButton
strings.json    ← translation source of truth (update first, then sync en.json and it.json)
translations/   ← en.json, it.json
```
