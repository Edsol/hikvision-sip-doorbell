# Architecture

## Component overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Home Assistant                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              DoorbellCoordinator                    │   │
│  │                                                     │   │
│  │  Call state tracking:                               │   │
│  │    async_track_state_change_event on MQTT sensor    │   │
│  │    → updates call_state (ringing / idle / etc.)     │   │
│  │                                                     │   │
│  │  On mode/number/fallback change or HA startup:      │   │
│  │    _async_write_routing_db()                        │   │
│  │      → AMI DBPut → AstDB["routing/channel"]         │   │
│  │      → AMI DBPut → AstDB["routing/mode"]            │   │
│  │      → AMI DBPut → AstDB["routing/fallback"]        │   │
│  │                                                     │   │
│  │  On setup (sip_domain=placeholder):                 │   │
│  │    _async_discover_sip_domain()                     │   │
│  │      → AMI PJSIPShowEndpoint → FromDomain           │   │
│  │      → async_update_entry (persisted)               │   │
│  │                                                     │   │
│  │  Persistence:                                       │   │
│  │    HA Store → mode, selected_phone_entity           │   │
│  │    Config entry → sip_domain (after discovery)      │   │
│  └──────────┬──────────────────────────────────────────┘   │
│             │                                               │
│    ┌────────▼──────────────────────────────┐               │
│    │           Entities                    │               │
│    │                                       │               │
│    │  select.doorbell_mode                 │               │
│    │  select.number_to_call     [config]   │               │
│    │  select.internal_fallback  [config]   │               │
│    │  sensor.call_state                    │               │
│    │  sensor.behavior_summary   [diag]     │               │
│    │  sensor.doorbell_extension [diag]     │               │
│    │  sensor.internal_extension [diag]     │               │
│    │  sensor.sip_trunk          [diag]     │               │
│    │  sensor.sip_domain         [diag]     │               │
│    │  button.discover_sip_domain [diag]    │               │
│    │  button.simulate_ring       [diag]    │               │
│    │  button.sync_routing_db     [diag]    │               │
│    └───────────────────────────────────────┘               │
└──────────────────────┬──────────────────────────────────────┘
                       │ AMI DBPut (on routing change)
          ┌────────────▼────────────┐
          │   Asterisk PBX (AstDB)  │
          │                         │
          │  /routing/channel       │
          │  /routing/mode          │
          │  /routing/fallback      │
          └──────────┬──────────────┘
                     │ DB(routing/channel) at ring time
          ┌──────────▼──────────────┐
          │   Asterisk dialplan     │
          │   [from-door]           │
          │                         │
          │  Answer()               │
          │  Dial(${DEST}, 45)      │
          └─────────────────────────┘
```

## Data flow — incoming call

```
1. Doorbell panel rings → SIP INVITE to Asterisk
2. Asterisk [from-door]: Answer() → read DB(routing/channel) → Dial(${DEST}, 45)
3. Two-way audio established directly between Asterisk endpoints
   (HA is NOT in the call path at ring time)

Separately:
4. Hikvision Addons addon publishes to MQTT sensor
5. coordinator._on_call_state() updates call_state entity (UI only)
```

HA is not in the real-time call path. It only writes routing to AstDB when mode/phone/fallback changes — Asterisk reads that value at ring time.

## Data flow — routing write

```
Trigger: mode change / phone selection / fallback change / HA startup / manual button press
  │
  ▼
coordinator._compute_channel():
  - at_home + 6002 registered       → "PJSIP/6002"
  - at_home + 6002 not registered:
      fallback=wait                  → "PJSIP/6002" (dialplan handles wait)
      fallback=call_external         → "<trunk>sip:<phone>@<domain>"
      fallback=none                  → ""
  - away_from_home / vacation        → "<trunk>sip:<phone>@<domain>"
  - deactivated                      → ""
  │
  ▼
AMI DBPut:
  routing/channel  = computed channel (or "" for deactivated/none)
  routing/mode     = current mode string
  routing/fallback = internal_fallback setting
```

## Data flow — SIP domain discovery

```
1. Coordinator setup: sip_domain == DEFAULT_SIP_DOMAIN ("sip.example.com")
2. async_create_task(_async_discover_sip_domain(force=False))
3. Waits up to 15s for hass.data["asterisk"] to be populated
4. Gets AMI client: hass.data["asterisk"][entry_id]["client"]
5. Registers event listener for EndpointDetail + EndpointDetailComplete
6. Sends: PJSIPShowEndpoint Endpoint=<trunk_name>
7. EndpointDetail event arrives with FromDomain=<domain>
8. Removes event listeners
9. Updates self._sip_domain
10. Persists: hass.config_entries.async_update_entry(entry, data={..., "sip_domain": domain})
11. async_update_listeners() → sensor.sip_domain updates in UI
```

Manual re-discovery: `button.discover_sip_domain` calls `_async_discover_sip_domain(force=True)`.

## Config entry vs runtime state

| Data | Where stored | When updated |
|---|---|---|
| `device_id`, `doorbell_extension`, `internal_extension`, `sip_trunk` | Config entry (data) | Only via options flow |
| `sip_domain` | Config entry (data) | Config flow + auto-discovery |
| `mode_phone_map` | Config entry (data) | Options flow (per-mode phone numbers) |
| `enabled_modes` | Config entry (data) | Options flow |
| `mode` | HA Store (`.storage/`) | Every `async_set_mode()` call |
| `selected_phone_entity` | HA Store | Every `async_set_selected_phone_entity()` call |
| `internal_fallback` | HA Store | Every `async_set_internal_fallback()` call |
| `call_state` | Memory only | Every MQTT sensor state change |

## Why AstDB instead of AMI Originate

The previous approach had HA call `AMI Originate` at every doorbell ring. This required HA to be in the real-time call path, which introduced latency and a failure mode if the HA → Asterisk AMI connection was slow or unavailable at ring time.

With the AstDB approach, **HA writes routing once** when settings change. Asterisk reads a local database key at ring time and dials directly — no HA involvement, no extra latency, no call-path dependency.

| | AMI Originate | AstDB |
|---|---|---|
| HA in call path | Yes | No |
| Latency added by HA | Yes | No |
| Routing change latency | Immediate | Immediate |
| Failure mode | HA unavailable at ring time | AstDB empty (use Sync button) |
| Complexity | Higher (Originate params) | Lower (DBPut + dialplan read) |
