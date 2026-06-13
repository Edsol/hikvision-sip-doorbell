# Hikvision SIP Doorbell

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![HA Version](https://img.shields.io/badge/Home%20Assistant-2023.4%2B-blue)](https://www.home-assistant.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Route Hikvision doorbell calls through Asterisk — without the Hikvision app.

When someone rings your **Hikvision DS-KV6113** (or compatible) doorbell, this integration:
- rings your **indoor SIP phone** when you're home
- calls your **mobile number** when you're away or on vacation
- does **nothing** when deactivated

Everything is controlled via a simple mode selector in Home Assistant.

---

## How it works

```
Doorbell rings
    │
    ▼
MQTT event (Hikvision Addons addon)
    │
    ▼
Home Assistant — checks current mode
    │
    ├─ at_home      → rings indoor SIP extension (e.g. a desk phone or softphone)
    ├─ away_from_home → calls your mobile via SIP trunk
    ├─ vacation      → calls your mobile via SIP trunk
    └─ deactivated   → no call placed
```

No polling, no AGI scripts. Home Assistant pushes directly to Asterisk via **AMI Originate**.

---

## Requirements

| Requirement | Notes |
|---|---|
| [Hikvision Addons](https://github.com/pergolafabio/Hikvision-Addons) | MQTT addon — publishes doorbell events to Home Assistant |
| [Asterisk integration](https://github.com/TECH7Fox/asterisk-hass-integration) | Connects HA to your Asterisk PBX via AMI |
| Asterisk PBX | With at least one PJSIP extension and optionally a SIP trunk |
| Home Assistant MQTT | Standard HA MQTT integration |

---

## Installation

### Via HACS (recommended)

1. Open HACS → **Integrations** → ⋮ menu → **Custom repositories**
2. Add this repository URL, category: **Integration**
3. Search for **Hikvision SIP Doorbell** and install
4. Restart Home Assistant

### Manual

1. Download and copy the `hikvision_sip_doorbell` folder into your `custom_components/` directory
2. Restart Home Assistant

---

## Setup

Go to **Settings → Integrations → Add Integration → Hikvision SIP Doorbell**.

The setup wizard has two steps:

### Step 1 — Device & SIP settings

All fields use **entity selectors** — just pick from dropdowns, no typing required.

| Field | What to select |
|---|---|
| **MQTT sensor** | The `Call state` sensor from your doorbell (created by Hikvision Addons) |
| **Doorbell SIP extension** | The Asterisk PJSIP endpoint for the doorbell panel (e.g. `PJSIP/6001`) |
| **Indoor SIP extension** | The Asterisk PJSIP endpoint to ring when at home (e.g. `PJSIP/6002`) |
| **SIP trunk** | The Asterisk trunk for external calls (e.g. `PJSIP/my-trunk`) |
| **VoIP domain** | Your SIP provider domain — **auto-discovered from Asterisk** after setup |

### Step 2 — Phone numbers

Select the `input_text` entities that hold the phone numbers to call for each external mode. You can use the same number for both modes, or different ones.

> **Phone number format**: the value in `input_text` is used as-is in the SIP URI. Use your provider's expected format (e.g. `+391234567890` or `0391234567890`).

---

## Device page

After setup, the device page shows:

**Controls**
- `Doorbell Mode` — change between at_home / away_from_home / vacation / deactivated

**Sensors**
- `Call State` — current doorbell state (idle, ringing, answered, dismissed)
- `Number to Call` — phone number active for the current mode
- `Active Contact` — contact name shown on the doorbell panel

**Diagnostics**
- `Doorbell Extension`, `Internal Extension`, `SIP Trunk`, `SIP Domain` — active configuration values
- `Discover SIP Domain` button — re-reads the VoIP domain from Asterisk on demand

---

## SIP domain auto-discovery

You don't need to know your SIP provider's domain in advance. After the first setup:

1. The integration reads it automatically from Asterisk using the `PJSIPShowEndpoint` AMI command
2. The `SIP Domain` sensor updates with the discovered value (e.g. `sip.myprovider.com`)
3. The value is saved permanently — discovery only runs once unless you press the button again

---

## Asterisk configuration

### extensions.conf

```ini
[from-door]
exten => 6002,1,Dial(PJSIP/6002,30)
exten => 6002,n,Hangup()
```

### manager.conf

The Home Assistant AMI user needs `originate` in both read and write permissions:

```ini
[homeassistant]
secret = your_secret
read = system,call,log,verbose,agent,user,config,dtmf,reporting,cdr,dialplan,originate
write = system,call,log,verbose,agent,user,config,dtmf,reporting,cdr,dialplan,originate
```

---

## Automations

You can change the doorbell mode automatically using Home Assistant automations. Example — set to `away_from_home` when everyone leaves:

```yaml
automation:
  - alias: "Doorbell: set away when last person leaves"
    trigger:
      - platform: state
        entity_id: group.household
        to: not_home
    action:
      - action: select.select_option
        target:
          entity_id: select.doorbell_mode
        data:
          option: away_from_home
```

---

## Troubleshooting

**No call when someone rings**
- Check that `sensor.call_state` changes to `ringing` when the doorbell is pressed
- Enable debug logging (see below) and look for `AMI Originate` log lines

**SIP Domain shows `sip.example.com`**
- Press the **Discover SIP Domain** button on the device page
- If it still fails, verify that the Asterisk integration is connected and the trunk name is correct

**External call falls back to internal**
- The `input_text` entity for the current mode is empty or unavailable

**Enable debug logging**

```yaml
# configuration.yaml
logger:
  logs:
    custom_components.hikvision_sip_doorbell: debug
```

---

## Tested devices

| Model | Firmware | Status |
|---|---|---|
| DS-KV6113-WPE1(C) | V3.7.0 | ✅ Tested |

Other Hikvision doorbell models supported by [Hikvision Addons](https://github.com/pergolafabio/Hikvision-Addons) should work — open an issue if you test one.

---

## License

MIT
