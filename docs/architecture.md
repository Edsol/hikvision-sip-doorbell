# Architecture

## Component overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Home Assistant                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              DoorbellCoordinator                    │   │
│  │                                                     │   │
│  │  MQTT subscriptions:                                │   │
│  │    hikvision/<id>/call_state  →  call_state         │   │
│  │    hikvision/<id>/contact     →  active_contact     │   │
│  │                                                     │   │
│  │  On call_state=ringing:                             │   │
│  │    _async_originate()                               │   │
│  │      → asterisk.send_action (AMI Originate)         │   │
│  │                                                     │   │
│  │  On setup (sip_domain=placeholder):                 │   │
│  │    _async_discover_sip_domain()                     │   │
│  │      → AMI PJSIPShowEndpoint → FromDomain           │   │
│  │      → async_update_entry (persisted)               │   │
│  │                                                     │   │
│  │  Persistence:                                       │   │
│  │    HA Store → mode, active_contact                  │   │
│  │    Config entry → sip_domain (after discovery)      │   │
│  └──────────┬──────────────────────────────────────────┘   │
│             │                                               │
│    ┌────────▼──────────────────────────────┐               │
│    │           Entities                    │               │
│    │                                       │               │
│    │  select.doorbell_mode                 │               │
│    │  sensor.call_state                    │               │
│    │  sensor.number_to_call                │               │
│    │  sensor.active_contact                │               │
│    │  sensor.doorbell_extension  [diag]    │               │
│    │  sensor.internal_extension  [diag]    │               │
│    │  sensor.sip_trunk           [diag]    │               │
│    │  sensor.sip_domain          [diag]    │               │
│    │  button.discover_sip_domain [diag]    │               │
│    └───────────────────────────────────────┘               │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │   Asterisk PBX (AMI)    │
          │                         │
          │  Originate              │
          │    Channel: PJSIP/6002  │
          │    or PJSIP/trunk/sip:  │
          │    <number>@<domain>    │
          └─────────────────────────┘
```

## Data flow — incoming call

```
1. Doorbell panel rings
2. Hikvision Addons addon publishes to hikvision/<device_id>/call_state = "ringing"
3. coordinator._on_call_state() receives the MQTT message
4. coordinator.hass.async_create_task(_async_originate())
5. _async_originate() reads:
     - DIAL_ROUTE[self.mode]        → "internal" / "external" / "none"
     - self._internal_ext           → "6002"
     - self._sip_trunk              → "PJSIP/my-trunk/"
     - self._sip_domain             → "sip.myprovider.com"
     - self.number_to_call          → reads input_text entity state
6. Builds AMI Originate parameters
7. hass.services.async_call("asterisk", "send_action", {...})
8. Asterisk places the call
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

Manual re-discovery: `button.discover_sip_domain` calls `_async_discover_sip_domain(force=True)`, which skips the "already set" check.

## Config entry vs runtime state

| Data | Where stored | When updated |
|---|---|---|
| `device_id`, `doorbell_extension`, `internal_extension`, `sip_trunk` | Config entry (data) | Only via config flow / options flow |
| `sip_domain` | Config entry (data) | Config flow + auto-discovery |
| `mode` | HA Store (`.storage/`) | Every `async_set_mode()` call |
| `active_contact` | HA Store | Every MQTT contact message + on unload |
| `call_state` | Memory only | Every MQTT call_state message |
| `mode_map` | Config entry (data) | Only via options flow |

## Why AMI Originate instead of AGI

The previous approach used an Asterisk AGI script that polled a Home Assistant REST sensor to decide where to route the call. This had two problems:

1. **Race condition**: the AGI script ran when the call arrived at Asterisk, but the HA sensor might not be updated yet
2. **HTTP dependency**: Asterisk needed to reach the HA REST API, adding latency and a failure mode

With AMI Originate, **HA pushes to Asterisk** when the MQTT event arrives. There is no polling, no HTTP call from Asterisk to HA, and no race condition.
