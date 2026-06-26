# Asterisk Setup Guide

This guide documents the Asterisk configuration required to use `hikvision_sip_doorbell` with full two-way audio, both for internal SIP clients (WebRTC/SIP-Core) and external calls via a SIP trunk.

The configuration was developed and tested with:
- **Asterisk 23.2.0**
- **Hikvision DS-KV6113-WPE1(C)** doorbell
- **Iliad VoIP** SIP trunk (IPv6)
- **SIP-Core** browser WebRTC client

---

## Architecture

```
HA (mode/number change) ──AMI DBPut──► AstDB["routing/channel"] = "PJSIP/..."

Doorbell (6001) ──INVITE──► Asterisk [from-door]
                                │
                                └─ DB(routing/channel) → Dial(${DEST},45)
                                        │
                                        └─ two-way audio established
```

HA writes to AstDB **only when the mode or phone number changes**, not at ring time.
Asterisk reads the channel from AstDB at ring time and dials directly — HA is not
in the call path, so the call starts immediately even if HA is temporarily unavailable.

---

## rtp.conf

```ini
[general]
rtpstart=10000
rtpend=20000
strictrtp=yes
icesupport=true
dtlsenable=true
```

---

## pjsip.conf

### Global

```ini
[global]
type=global
external_media_address=<YOUR_PUBLIC_IP>
external_signaling_address=<YOUR_PUBLIC_IP>
local_net=192.168.1.0/24        ; adjust to your LAN subnet
```

### Doorbell endpoint (6001)

```ini
[6001]
type=endpoint
transport=transport-udp         ; doorbell uses plain SIP over UDP on LAN
context=from-door
disallow=all
allow=alaw                      ; DS-KV6113 works best with alaw only
dtmf_mode=info
auth=6001
aors=6001
direct_media=no
rewrite_contact=yes
force_rport=yes
rtp_symmetric=yes
use_ptime=yes                   ; critical: respect the 20ms ptime declared in SDP

[6001]
type=auth
auth_type=userpass
username=6001
password=<YOUR_PASSWORD>

[6001]
type=aor
max_contacts=1
remove_existing=yes
qualify_frequency=60
contact=sip:6001@<DOORBELL_IP>:5060
```

> **Note:** `use_ptime=yes` is critical. Without it, Asterisk may repacketize RTP frames
> into different sizes, causing packet drops on one direction of the bridge.

### Internal WebRTC extension (6002 — SIP-Core)

```ini
[6002]
type=endpoint
context=from-ha
disallow=all
allow=alaw,ulaw,opus
auth=6002
aors=6002
direct_media=no
rewrite_contact=yes
force_rport=yes
rtp_symmetric=yes
from_user=6002
webrtc=yes                      ; enables DTLS-SRTP + ICE for browser WebRTC
dtls_auto_generate_cert=yes

[6002]
type=auth
auth_type=userpass
username=6002
password=<YOUR_PASSWORD>

[6002]
type=aor
max_contacts=1
remove_existing=yes
```

### SIP trunk (Iliad example — IPv6)

```ini
[iliad-reg]
type=registration
transport=transport-udp6
outbound_auth=iliad-auth
server_uri=sip:voip.iliad.it
client_uri=sip:<YOUR_NUMBER>@voip.iliad.it:5060
outbound_proxy=sip:proxy-voip-2.iliad.it\;lr
retry_interval=60
forbidden_retry_interval=300
expiration=600

[iliad-trunk]
type=endpoint
transport=transport-udp6        ; Iliad requires IPv6
context=from-iliad
disallow=all
allow=ulaw,alaw
use_ptime=yes                   ; critical: same as 6001, prevents packet drop
outbound_auth=iliad-auth
aors=iliad-aor
from_user=<YOUR_NUMBER>
from_domain=voip.iliad.it
outbound_proxy=sip:proxy-voip-2.iliad.it\;lr
direct_media=no
rewrite_contact=yes
force_rport=yes
rtp_symmetric=yes
rtp_ipv6=yes                    ; required: RTP must also use IPv6 toward Iliad
callerid=<YOUR_NUMBER>
send_pai=no
send_rpid=no
trust_id_outbound=yes
timers=no                       ; prevents call drop after session-expires timeout

[iliad-auth]
type=auth
auth_type=userpass
username=<YOUR_NUMBER>
password=<YOUR_SIP_PASSWORD>

[iliad-aor]
type=aor
contact=sip:voip.iliad.it
```

### Transports

```ini
[transport-udp]
type=transport
protocol=udp
bind=0.0.0.0:5060
local_net=192.168.1.0/24
external_media_address=<YOUR_PUBLIC_IP>
external_signaling_address=<YOUR_PUBLIC_IP>

[transport-udp6]
type=transport
protocol=udp
bind=[::]:5060

[transport-wss]
type=transport
protocol=wss
bind=0.0.0.0:8089
cert_file=/etc/asterisk/keys/fullchain.pem
priv_key_file=/etc/asterisk/keys/privkey.pem
```

> **WSS transport** is required for SIP-Core browser WebRTC. The certificate must be
> trusted by the browser — use mkcert for local development or a real cert for production.

---

## extensions.conf

```ini
[from-door]
; Doorbell calls Asterisk: answer immediately to keep ringing, poll endpoint availability,
; then dial target from AstDB. routing/endpoint is "" for external calls (skip poll).
exten => _X.,1,NoOp(Doorbell ring on ${EXTEN})
 same => n,Set(CALLERID(num)=Doorbell)
 same => n,Set(CALLERID(name)=Doorbell)
 same => n,Answer()
 same => n,Playtones(ring)
 same => n,Set(DEST=${DB(routing/channel)})
 same => n,Set(ENDPT=${DB(routing/endpoint)})
 same => n,GotoIf($["${DEST}" = ""]?noanswer)
 same => n,Set(ATTEMPTS=0)
 same => n(retry),GotoIf($[${ATTEMPTS} >= 9]?noanswer)
 same => n,Set(ATTEMPTS=$[${ATTEMPTS} + 1])
 same => n,GotoIf($["${ENDPT}" = ""]?dial)
 same => n,GotoIf($["${DEVICE_STATE(PJSIP/${ENDPT})}" != "UNAVAILABLE"]?dial)
 same => n,Wait(5)
 same => n,Goto(retry)
 same => n(dial),NoOp(Dialling ${DEST})
 same => n,Dial(${DEST},30)
 same => n,Hangup()

exten => noanswer,1,StopPlaytones()
exten => noanswer,n,Hangup()

[out-iliad]
exten => _X.,1,NoOp(OUT via Iliad: ${EXTEN})
 same => n,Dial(PJSIP/${EXTEN}@iliad-trunk,45)
 same => n,Hangup()
```

> **How it works:**
> - `Answer()` + `Playtones(ring)` keeps the doorbell ringing immediately, before any destination answers.
> - For internal calls (`routing/endpoint` = e.g. `6002`): polls endpoint state with `DEVICE_STATE` every 5s, up to 9 attempts (~45s). Dials only when the endpoint is available — prevents premature `Cancelled` being sent to SIP clients like SIP-Core.
> - For external calls (`routing/endpoint` = `""`): skips the poll and dials immediately via trunk.
> - `deactivated` mode: `routing/channel` is empty → hangs up immediately.
> - GotoIf labels use `?label` syntax (no `,1`) — required for labels within the same extension.
>
> `routing/channel` and `routing/endpoint` are written by HA via AMI `DBPut` whenever mode,
> phone number, or fallback changes. Verify with:
> `asterisk -rx "database show routing"`

### DTMF gate control

Pressing `#` on the mobile phone during an active call opens the gate relay on the doorbell panel.
This works transparently via Asterisk's automatic DTMF conversion:

- Iliad trunk uses **RFC 4733** (`dtmf_mode=rfc4733`)
- Doorbell endpoint 6001 uses **SIP INFO** (`dtmf_mode=info`)
- Asterisk bridges the two legs and converts DTMF format automatically — no extra configuration needed

No dialplan changes are required. The `#` keypress is forwarded to the doorbell during any active call.

---

## AMI (manager.conf)

The integration uses AMI to write routing data to AstDB (`DBPut`). Minimum required configuration:

```ini
[general]
enabled = yes
port = 5038
bindaddr = 0.0.0.0        ; restrict to 127.0.0.1 if HA is on the same host

[homeassistant]
secret = <YOUR_AMI_SECRET>
read = all
write = all
```

Verify routing is set correctly after HA startup:

```bash
asterisk -rx "database show routing"
```

Expected output:
```
/routing/channel         : PJSIP/6002
/routing/fallback        : wait
/routing/mode            : at_home
```

---

## Doorbell webUI settings (Video/Audio)

In the Hikvision webUI under **Network → Device Access → VoIP**:
- Register User Name: `6001`
- Server IP: Asterisk IP
- Server Port: `5060`

Under **Video/Audio → Audio**:
- Input Volume: `10`
- Output Volume: `10`
- Speak Volume: `10`
- Audio Sampling Rate: `8 KHz`
- SIP Audio Encoding: enable at minimum `G.711ulaw` and `G.711alaw`

---

## Key lessons learned

| Issue | Root cause | Fix |
|---|---|---|
| One-way audio (doorbell → cell) | `use_ptime` not set → Asterisk repacketized RTP, causing drops on Iliad trunk | Add `use_ptime=yes` to both 6001 and iliad-trunk endpoints |
| WebRTC fails | Missing `webrtc=yes` on 6002 endpoint and `icesupport=true` in rtp.conf | Add both |
| WSS connection refused | Browser blocked mixed content (HTTPS HA + WS Asterisk) | Switch Asterisk to WSS with valid certificate |
| Call drops after ~30s | `timers=yes` on Iliad trunk triggers session-expires | Set `timers=no` on Iliad trunk |
| DTMF `#` not opening gate | Endpoint mode mismatch (rfc4733 vs info) | Asterisk converts automatically — no config needed; verify `dtmf_mode` on both endpoints |
| AstDB empty after Asterisk restart | HA not yet connected when Asterisk starts | Use "Sync Routing to Asterisk" button in HA diagnostics to force a DBPut |
| Doorbell sounds busy when SIP-Core not open | `Dial(PJSIP/6002)` fails immediately with CHANUNAVAIL if endpoint not registered | Use `DEVICE_STATE` poll loop in dialplan — only dial when endpoint is `Avail` |
| SIP-Core popup opens and closes immediately | `Dial()` on unavailable endpoint sends `Cancelled` to registered SIP clients | Same fix — poll with `DEVICE_STATE` before dialling |
| GotoIf label jump fails (`invalid extension`) | `?label,1` syntax tells Asterisk to find an extension named `label`, not a dialplan label | Use `?label` (no `,1`) for jumps within the same extension |
| Doorbell called wrong extension directly | Number Settings on Hikvision panel pointed to `6002` instead of `6001` | Set SIP Number to `6001` (the endpoint with `context=from-door`) |
| No ringback during external call (Iliad 13s delay) | `StopPlaytones()` placed before `Dial()` in `(dial)` label — tone stopped before trunk answered | Remove `StopPlaytones()` from `(dial)`; keep only on `noanswer`. `Dial()` stops tones automatically on answer |
