"""Constants for the Hikvision SIP Doorbell integration."""

DOMAIN = "hikvision_sip_doorbell"

PLATFORMS = ["select", "sensor", "binary_sensor", "button"]

# Config entry keys
CONF_DEVICE_ID = "device_id"                # MQTT device topic identifier (e.g. "videocitofono")
CONF_DOORBELL_EXTENSION = "doorbell_extension"  # SIP number of the doorbell panel (e.g. "6001")
CONF_INTERNAL_EXTENSION = "internal_extension"  # Asterisk PJSIP extension to ring indoors (e.g. "6002")
CONF_SIP_TRUNK = "sip_trunk"                # Asterisk trunk prefix (e.g. "PJSIP/iliad-trunk/")
CONF_SIP_DOMAIN = "sip_domain"              # VoIP domain for external calls (e.g. "voip.iliad.it")

CONF_CALL_STATE_ENTITY = "call_state_entity"  # entity_id of the Hikvision MQTT call_state sensor
CONF_ENABLED_MODES = "enabled_modes"          # list of enabled doorbell modes
CONF_MODE_PHONE_MAP = "mode_phone_map"        # dict: mode → list of input_text entity_ids

# Behaviour when at_home internal extension is unreachable (not registered)
# "wait"          — keep channel open, doorbell keeps ringing (user answers from panel)
# "call_external" — fall back to external call (same as away_from_home)
# "none"          — hang up immediately
CONF_INTERNAL_FALLBACK = "internal_fallback"
INTERNAL_FALLBACK_OPTIONS = ["wait", "call_external", "none"]
DEFAULT_INTERNAL_FALLBACK = "wait"
AMI_WAIT_ON_FALLBACK_S = 25   # seconds to keep channel open when fallback=wait

# Behaviour when mode is deactivated
# "hangup" — answer and hang up immediately (default)
# "ring"   — do not answer; doorbell keeps ringing until its own timeout
CONF_DEACTIVATED_BEHAVIOR = "deactivated_behavior"
DEACTIVATED_BEHAVIOR_OPTIONS = ["hangup", "ring"]
DEFAULT_DEACTIVATED_BEHAVIOR = "hangup"
ASTDB_CHANNEL_RING = "__ring__"   # sentinel: Asterisk dialplan keeps ringing without answering

# Doorbell operating modes
DOORBELL_MODES = [
    "at_home",
    "away_from_home",
    "vacation",
    "deactivated",
]

# Modes that require an external phone number
EXTERNAL_MODES = {"away_from_home", "vacation"}

# Dial routing per mode
DIAL_ROUTE = {
    "at_home": "internal",
    "away_from_home": "external",
    "vacation": "external",
    "deactivated": "none",
}

# AstDB routing keys — written by HA on mode/number change, read by Asterisk dialplan at ring time
ASTDB_FAMILY = "routing"
ASTDB_KEY_CHANNEL = "channel"       # full channel string Asterisk will Dial()
ASTDB_KEY_ENDPOINT = "endpoint"     # PJSIP endpoint name to availability-check before Dial() (e.g. "6002"), or "" for external
ASTDB_KEY_MODE = "mode"             # current mode label (informational)
ASTDB_KEY_FALLBACK = "fallback"     # internal fallback value (informational)

# Default values
DEFAULT_DOORBELL_EXTENSION = "6001"
DEFAULT_INTERNAL_EXTENSION = "6002"
DEFAULT_SIP_TRUNK = "PJSIP/my-trunk/"
DEFAULT_SIP_DOMAIN = "sip.example.com"

# Entity unique id suffixes
SUFFIX_MODE = "mode"
