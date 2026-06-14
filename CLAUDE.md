# CLAUDE.md — hikvision_sip_doorbell

Context file for AI assistants working on this codebase. Read this before making any changes.

---

## What this project is

A Home Assistant custom integration for the **Hikvision DS-KV6113-WPE1(C)** video doorbell (and compatible models). It bridges the [Hikvision Addons MQTT doorbell addon](https://github.com/pergolafabio/Hikvision-Addons/tree/main/doorbell) with an **Asterisk PBX** for flexible SIP call routing — without using the Hikvision app.

---

## Architecture overview

```
HA (mode/number/fallback change or startup)
  └── coordinator._async_write_routing_db()
        → AMI DBPut → AstDB["routing/channel"] = "PJSIP/..." | ""
        → AMI DBPut → AstDB["routing/mode"]
        → AMI DBPut → AstDB["routing/fallback"]

Hikvision Addons MQTT addon
  └── publishes sensor state to HA (e.g. sensor.videocitofono_call_state)

coordinator._on_call_state()
  └── async_track_state_change_event on the MQTT sensor entity
        → updates call_state, triggers UI update (no AMI call at ring time)

Asterisk [from-door] at ring time
  └── Answer() → DB(routing/channel) → Dial(${DEST},45)
        └── two-way audio established directly
```

**HA is NOT in the real-time call path.** HA writes routing to AstDB when settings change. Asterisk reads that value at ring time and dials directly.

Call state is tracked via `async_track_state_change_event` on the existing HA MQTT sensor entity — **not** via direct MQTT subscription. This avoids MQTT topic guessing and unique_id collisions.

---

## Platform files

| File | Entities | Notes |
|---|---|---|
| `coordinator.py` | — | Central state, call state tracking, AstDB write, SIP discovery, persistence |
| `select.py` | `select.doorbell_mode` | Modes from `coordinator.enabled_modes` (dynamic, config-driven) |
| `select.py` | `select.internal_fallback` | wait / call_external / none — `EntityCategory.CONFIG` |
| `select.py` | `select.number_to_call` | Friendly names of `input_text` entities for current mode — `EntityCategory.CONFIG` |
| `sensor.py` | `sensor.call_state` | Operational — idle / ringing / answered / dismissed |
| `sensor.py` | `sensor.doorbell_extension`, `sensor.internal_extension`, `sensor.sip_trunk`, `sensor.sip_domain` | `EntityCategory.DIAGNOSTIC` |
| `sensor.py` | `sensor.behavior_summary` | `EntityCategory.DIAGNOSTIC` — human-readable description of current routing behaviour |
| `button.py` | `button.discover_sip_domain` | `EntityCategory.DIAGNOSTIC` — manual SIP domain re-discovery |
| `button.py` | `button.simulate_ring` | `EntityCategory.DIAGNOSTIC` — simulates ringing/idle state transition |
| `button.py` | `button.sync_routing_db` | `EntityCategory.DIAGNOSTIC` — manually re-writes AstDB routing |
| `config_flow.py` | — | Single-step config flow + menu-driven options flow |

---

## Config entry data structure

```python
{
    "device_id": "myfrontdoor",
    "call_state_entity": "sensor.myfrontdoor_call_state",
    "doorbell_extension": "6001",
    "internal_extension": "6002",
    "sip_trunk": "PJSIP/my-trunk/",
    "sip_domain": "sip.example.com",        # auto-discovered, starts as placeholder
    "enabled_modes": ["at_home", "away_from_home", "deactivated"],  # always includes deactivated
    "mode_phone_map": {                      # per-mode phone entity lists
        "away_from_home": ["input_text.my_phone"],
        "vacation": ["input_text.my_phone", "input_text.backup_phone"],
    }
}
```

`sip_domain` is auto-updated by `_async_discover_sip_domain()` on first setup, or on demand via the button.

---

## Config flow

**Config step — Device settings** (all via EntitySelector):

| Field | Selector | How resolved |
|---|---|---|
| `device_id` / `call_state_entity` | MQTT sensor (integration: mqtt) | `_device_id_from_mqtt_entity()` |
| `doorbell_extension` | Asterisk binary_sensor | `_endpoint_name_from_entity()` → e.g. `6001` |
| `internal_extension` | Asterisk binary_sensor | same → e.g. `6002` |
| `sip_trunk` | Asterisk binary_sensor | stored as `PJSIP/<name>/` |
| `sip_domain` | Free text | Default `sip.example.com` — auto-discovered post-setup |

**Options flow** — menu-driven (`async_show_menu`):
- **SIP Settings**: edit SIP configuration
- **Enabled Modes**: multi-select which modes to activate (deactivated always forced in)
- **Phone Numbers**: select mode then configure per-mode phone entities
- **Save & Close**: persists all changes

---

## Runtime entities

### select.number_to_call
- Options: **friendly names** of `input_text` entities configured for the **current mode**
- Hidden when mode is not in `EXTERNAL_MODES` (i.e. internal-only modes)
- Coordinator resolves friendly name ↔ entity_id; reading phone number: `hass.states.get(entity_id).state`
- Persistence: `selected_phone_entity` saved in Store; reset on mode change

### select.internal_fallback
Applies only when `mode=at_home` and the indoor extension is not registered in Asterisk:
- `wait` — pass `PJSIP/6002` anyway, `Answer()` + 45s timeout in dialplan
- `call_external` — route to external number via SIP trunk (uses `number_to_call`)
- `none` — write empty channel to AstDB, doorbell hangs up immediately

### sensor.behavior_summary
Human-readable string updated on every coordinator state change. Examples:
- `"Will ring indoor extension 6002."`
- `"Indoor extension 6002 is not registered. Will call +39... via SIP trunk."`
- `"Will call external number +391234567890 (My Phone) via SIP trunk."`
- `"Doorbell is deactivated — calls will be ignored."`

---

## AstDB routing

`coordinator._compute_channel()` builds the channel string:

| Mode | Condition | Channel written |
|---|---|---|
| `at_home` | 6002 registered | `PJSIP/6002` |
| `at_home` | not registered, fallback=wait | `PJSIP/6002` |
| `at_home` | not registered, fallback=call_external | `<trunk>sip:<phone>@<domain>` |
| `at_home` | not registered, fallback=none | `""` |
| `away_from_home` / `vacation` | phone available | `<trunk>sip:<phone>@<domain>` |
| `away_from_home` / `vacation` | no phone | `PJSIP/6002` (fallback with warning) |
| `deactivated` | — | `""` |

AstDB write is triggered by: mode change, phone entity selection, fallback change, options update, HA startup. At startup, retries up to 3× with 5s delay if the Asterisk service isn't ready yet.

---

## MQTT / call state tracking

| HA entity | Values | Action |
|---|---|---|
| `sensor.<device_id>_call_state` (or configured entity) | idle / ringing / answered / dismissed | Updates `call_state` + notifies UI listeners |

The coordinator does **not** subscribe to MQTT directly. It uses `async_track_state_change_event` on the existing MQTT sensor entity. HA is **not** in the SIP call path at ring time.

---

## SIP domain auto-discovery

`coordinator._async_discover_sip_domain(force=False)`:

1. Triggered automatically at coordinator setup **only if** `sip_domain == DEFAULT_SIP_DOMAIN`
2. Also triggered manually via `button.discover_sip_domain` (`force=True`)
3. Waits up to 15 seconds for `hass.data["asterisk"]` to be populated
4. Uses the Asterisk integration's AMI client directly (`hass.data["asterisk"][entry_id]["client"]`)
5. Sends `PJSIPShowEndpoint <trunk_name>` → listens for `EndpointDetail` event
6. Extracts `FromDomain` field → persists to config entry via `async_update_entry`

The AMI client is accessed directly (not via `asterisk.send_action`) because `send_action` is fire-and-forget and cannot return event data.

---

## Persistence

`coordinator.py` uses `homeassistant.helpers.storage.Store`:
- `mode`
- `internal_fallback`
- `selected_phone_entity` (entity_id, not friendly name)

Storage key: `hikvision_sip_doorbell_<entry_id>`.

`sip_domain` is persisted in config entry data via `async_update_entry`.

---

## Entity unique_id convention

All unique_ids are prefixed with `{DOMAIN}_{device_id}_`. Example: `hikvision_sip_doorbell_myfrontdoor_call_state`.

---

## Translations — keep always in sync

**Rule: whenever you add or change a user-visible string, update all three files:**

```
strings.json              ← source of truth, English
translations/en.json      ← identical to strings.json
translations/it.json      ← Italian translation
```

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
const.py        ← modes, dial routes, config entry keys, AstDB keys, SIP defaults
coordinator.py  ← call state tracking, AstDB write, SIP discovery, persistence, behavior_summary
config_flow.py  ← config + options flow, entity resolution helpers
select.py       ← DoorbellModeSelect, InternalFallbackSelect, NumberToCallSelect
sensor.py       ← call_state (operational) + diagnostic sensors + behavior_summary sensor
button.py       ← DiscoverSipDomainButton, SimulateRingButton, SyncRoutingDbButton
strings.json    ← translation source of truth (update first, then sync en.json and it.json)
translations/   ← en.json, it.json
www/            ← hikvision-doorbell-card.js (Lovelace card for SIP-Core popup)
docs/           ← architecture.md, asterisk-setup.md, asterisk_integration.md
```
