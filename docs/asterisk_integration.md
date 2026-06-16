# Asterisk Integration

## How HA communicates with Asterisk

This integration uses the [Asterisk HA integration](https://github.com/TECH7Fox/asterisk-hass-integration) as a bridge to the Asterisk AMI (Asterisk Manager Interface).

Two AMI actions are used:

| Action | When | How called |
|---|---|---|
| `DBPut` | On every routing change (mode, phone, fallback, startup) | `hass.services.async_call("asterisk", "send_action", {...})` |
| `PJSIPShowEndpoint` | Once at startup (or on button press) | Direct AMI client from `hass.data["asterisk"]` |

`DBPut` is called via the HA service (fire-and-forget — no response needed).
`PJSIPShowEndpoint` uses the AMI client directly because we need to read the `EndpointDetail` event response.

---

## AstDB keys written by HA

HA writes four keys under the `routing` family whenever mode, phone number, or fallback changes — and once at startup:

| Key | Value | Example |
|---|---|---|
| `routing/channel` | Full channel string for `Dial()`, or `""` | `PJSIP/6002` or `PJSIP/my-trunk/sip:+39123@sip.provider.com` |
| `routing/endpoint` | PJSIP endpoint name to poll before `Dial()`, or `""` for external | `6002` (internal) or `""` (external/deactivated) |
| `routing/mode` | Current mode string | `at_home` |
| `routing/fallback` | Current internal fallback setting | `wait` |

Verify via:
```bash
asterisk -rx "database show routing"
```

Expected output (example for `at_home` mode):
```
/routing/channel   : PJSIP/6002
/routing/fallback  : wait
/routing/mode      : at_home
```

If AstDB is empty after an Asterisk restart, use the **Sync Routing to Asterisk** diagnostic button in HA — this re-writes all three keys without restarting HA.

---

## AMI DBPut parameters

Each key is written as a separate `DBPut` action:

```
Action: DBPut
Family: routing
Key: channel
Val: PJSIP/6002
```

```
Action: DBPut
Family: routing
Key: mode
Val: at_home
```

```
Action: DBPut
Family: routing
Key: fallback
Val: wait
```

---

## Required Asterisk configuration

### extensions.conf

Add a `[from-door]` context. Asterisk reads routing from AstDB, plays a ringback tone, and polls the endpoint for availability before dialling:

```ini
[from-door]
exten => _X.,1,NoOp(Doorbell ring on ${EXTEN})
 same => n,Set(CALLERID(num)=Doorbell)
 same => n,Set(CALLERID(name)=Doorbell)
 same => n,Answer()
 same => n,Playtones(ring)
 same => n,Set(DEST=${DB(routing/channel)})
 same => n,Set(ENDPT=${DB(routing/endpoint)})
 same => n,GotoIf($["${DEST}" = ""]?noanswer,1)
 same => n,Set(ATTEMPTS=0)
 same => n(retry),GotoIf($[${ATTEMPTS} >= 9]?noanswer,1)
 same => n,Set(ATTEMPTS=$[${ATTEMPTS} + 1])
 same => n,GotoIf($["${ENDPT}" = ""]?dial)
 same => n,GotoIf($["${DEVICE_STATE(PJSIP/${ENDPT})}" != "UNAVAILABLE"]?dial)
 same => n,Wait(5)
 same => n,Goto(retry)
 same => n(dial),StopPlaytones()
 same => n,Dial(${DEST},30)
 same => n,Hangup()

exten => noanswer,1,StopPlaytones()
exten => noanswer,n,Hangup()
```

- `Answer()` + `Playtones(ring)` keeps the doorbell ringing immediately, before the destination answers.
- For internal calls (`routing/endpoint` = `6002`): polls endpoint state every 5s, up to 9 attempts (~45s). Dials only when `Avail` — no premature `Cancelled` sent to SIP clients.
- For external calls (`routing/endpoint` = `""`): skips the poll and dials immediately via trunk.
- `deactivated` mode: empty `routing/channel` → hangs up immediately.

### manager.conf

```ini
[general]
enabled = yes
port = 5038
bindaddr = 0.0.0.0

[homeassistant]
secret = your_secret_here
read = all
write = all
```

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

The `from_domain` field in the endpoint section is what `_async_discover_sip_domain()` reads via `PJSIPShowEndpoint`.

---

## DTMF gate control

Pressing `#` on a mobile during an active call sends a DTMF tone via RFC 4733 (the SIP trunk standard). Asterisk automatically converts this to SIP INFO (the doorbell panel standard) when forwarding to the doorbell. No dialplan changes or configuration needed — this works out of the box.

---

## SIP domain discovery — technical detail

The discovery sends `PJSIPShowEndpoint` for the configured trunk name and listens for the `EndpointDetail` AMI event.

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

If `FromDomain` is empty, the discovery logs a warning and the domain stays at the placeholder. Set `from_domain` in `pjsip.conf` and press **Discover SIP Domain** again.

---

## Troubleshooting AMI

**AstDB is empty after Asterisk restart**

Press the **Sync Routing to Asterisk** button on the device page. This re-runs `_async_write_routing_db()` on demand.

**`Permission denied` on DBPut**

Check that `write = all` (or at minimum `write = system,call,config`) is set in `manager.conf`.

**Discovery finds no `FromDomain`**

Your trunk endpoint may not have `from_domain` set in `pjsip.conf`. Add it and reload PJSIP:
```bash
asterisk -rx "pjsip reload"
```
Then press **Discover SIP Domain** again.

**No call when doorbell rings**

1. Check `asterisk -rx "database show routing"` — if empty, use the Sync button
2. Enable HA debug logging and look for `AstDB routing update` lines
3. Check Asterisk CLI: `asterisk -rx "core show channels"` during a ring
