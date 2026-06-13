# Asterisk Integration

## How HA communicates with Asterisk

This integration uses the [Asterisk HA integration](https://github.com/TECH7Fox/asterisk-hass-integration) as a bridge to the Asterisk AMI (Asterisk Manager Interface).

Two AMI actions are used:

| Action | When | How called |
|---|---|---|
| `Originate` | On every `call_state=ringing` MQTT event | `hass.services.async_call("asterisk", "send_action", {...})` |
| `PJSIPShowEndpoint` | Once at startup (or on button press) | Direct AMI client from `hass.data["asterisk"]` |

`Originate` is called via the HA service (fire-and-forget is fine — we don't need the response).
`PJSIPShowEndpoint` uses the AMI client directly because we need to read the `EndpointDetail` event response.

---

## AMI Originate parameters

### Internal call (at_home mode)

```
Action: Originate
Channel: PJSIP/6002
Context: from-door
Exten: 6002
Priority: 1
Timeout: 30000
CallerID: Doorbell <6001>
Async: true
```

### External call (away_from_home / vacation modes)

```
Action: Originate
Channel: PJSIP/my-trunk/sip:+391234567890@sip.myprovider.com
Context: from-door
Exten: 6002
Priority: 1
Timeout: 30000
CallerID: Doorbell <6001>
Async: true
```

`Exten` is always the internal extension — Asterisk uses it as the dialplan entry point in `Context`. The actual destination is determined by `Channel`.

---

## Required Asterisk configuration

### extensions.conf

```ini
[from-door]
; Internal call — ring the indoor phone
exten => 6002,1,Dial(PJSIP/6002,30)
exten => 6002,n,Hangup()
```

External calls don't need a separate dialplan entry — the `Channel` in the Originate already specifies the full SIP URI via the trunk. Asterisk handles the routing through the trunk's outbound auth and registration.

### manager.conf

```ini
[general]
enabled = yes
port = 5038
bindaddr = 0.0.0.0

[homeassistant]
secret = your_secret_here
read = system,call,log,verbose,agent,user,config,dtmf,reporting,cdr,dialplan,originate
write = system,call,log,verbose,agent,user,config,dtmf,reporting,cdr,dialplan,originate
```

The `originate` permission is required in **both** `read` and `write`. Without it, the Originate action returns `Permission denied`.

### pjsip.conf (trunk example)

```ini
[my-trunk]
type=endpoint
transport=transport-udp
context=from-provider
disallow=all
allow=ulaw,alaw
outbound_auth=my-trunk-auth
aors=my-trunk-aor
from_domain=sip.myprovider.com    ; ← this is what auto-discovery reads

[my-trunk-auth]
type=auth
auth_type=userpass
username=your_username
password=your_password

[my-trunk-aor]
type=aor
contact=sip:sip.myprovider.com

[my-trunk-reg]
type=registration
outbound_auth=my-trunk-auth
server_uri=sip:sip.myprovider.com
client_uri=sip:your_username@sip.myprovider.com
```

The `from_domain` field in the endpoint section is what `_async_discover_sip_domain()` reads via `PJSIPShowEndpoint`. If your trunk config doesn't have `from_domain`, use the **Discover SIP Domain** button and enter it manually in the Options flow instead.

---

## SIP domain discovery — technical detail

The discovery sends `PJSIPShowEndpoint` for the configured trunk name and listens for the `EndpointDetail` AMI event. The event contains all PJSIP endpoint parameters, including `FromDomain`.

```
→ PJSIPShowEndpoint Endpoint=my-trunk
← Event: EndpointDetail
   ObjectName: my-trunk
   ObjectType: endpoint
   ...
   FromDomain: sip.myprovider.com   ← extracted
   ...
← Event: EndpointDetailComplete
```

If `FromDomain` is empty (trunk configured without it), the discovery logs a warning and the domain stays at the placeholder. The user can then set it manually via the Options flow or set `from_domain` in `pjsip.conf` and press the button again.

---

## Troubleshooting AMI

**`Permission denied` on Originate**

Check that `originate` is in both `read` and `write` in `manager.conf`, and that the `[general]` section comes before any user sections.

**`Originate` never places a call**

Enable HA debug logging and look for `AMI Originate` log lines. Also check the Asterisk CLI:
```
asterisk -rx "core show channels"
```

**Discovery finds no `FromDomain`**

Your trunk endpoint may not have `from_domain` set in `pjsip.conf`. Add it and reload PJSIP (`asterisk -rx "pjsip reload"`), then press **Discover SIP Domain** again.
