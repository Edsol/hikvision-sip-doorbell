"""Constants for the Hikvision SIP Doorbell integration."""

DOMAIN = "hikvision_sip_doorbell"

PLATFORMS = ["select", "sensor", "button"]

# Config entry keys
CONF_DEVICE_ID = "device_id"                # MQTT device topic identifier (e.g. "videocitofono")
CONF_DOORBELL_EXTENSION = "doorbell_extension"  # SIP number of the doorbell panel (e.g. "6001")
CONF_INTERNAL_EXTENSION = "internal_extension"  # Asterisk PJSIP extension to ring indoors (e.g. "6002")
CONF_SIP_TRUNK = "sip_trunk"                # Asterisk trunk prefix (e.g. "PJSIP/iliad-trunk/")
CONF_SIP_DOMAIN = "sip_domain"              # VoIP domain for external calls (e.g. "voip.iliad.it")

# Map: mode → input_text entity_id holding the phone number to call
# Only external modes need an entry; internal/none modes are handled automatically.
# Example: {"away_from_home": "input_text.my_phone", "vacation": "input_text.my_phone"}
CONF_MODE_MAP = "mode_map"
CONF_CALL_STATE_ENTITY = "call_state_entity"  # entity_id of the Hikvision MQTT call_state sensor

# Behaviour when at_home internal extension is unreachable (not registered)
# "wait"          — keep channel open, doorbell keeps ringing (user answers from panel)
# "call_external" — fall back to external call (same as away_from_home)
# "none"          — hang up immediately
CONF_INTERNAL_FALLBACK = "internal_fallback"
INTERNAL_FALLBACK_OPTIONS = ["wait", "call_external", "none"]
DEFAULT_INTERNAL_FALLBACK = "wait"
AMI_WAIT_ON_FALLBACK_S = 25   # seconds to keep channel open when fallback=wait

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

# AMI Originate defaults
AMI_CALLER_ID_NAME = "Doorbell"          # Display name in CallerID; combined with doorbell_extension
AMI_CONTEXT_INTERNAL = "from-door"
AMI_CONTEXT_EXTERNAL = "from-door"
AMI_TIMEOUT_MS = "30000"

# Default values
DEFAULT_DOORBELL_EXTENSION = "6001"
DEFAULT_INTERNAL_EXTENSION = "6002"
DEFAULT_SIP_TRUNK = "PJSIP/my-trunk/"
DEFAULT_SIP_DOMAIN = "sip.example.com"

# Entity unique id suffixes
SUFFIX_MODE = "mode"
SUFFIX_NUMBER_TO_CALL = "number_to_call"
