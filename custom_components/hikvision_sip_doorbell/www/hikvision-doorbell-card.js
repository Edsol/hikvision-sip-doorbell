import {
    LitElement,
    html,
    css,
} from "https://cdn.jsdelivr.net/npm/lit-element@4.2.0/+esm";

// ── State machine ─────────────────────────────────────────────────────────────
// idle        → popup closed, no call
// ringing     → incoming call, popup open, waiting for user action
// active      → call answered
// ended       → call finished, popup auto-closes after 2s

class HikvisionDoorbellDialog extends LitElement {

    static get properties() {
        return {
            _open:         { type: Boolean },
            _callState:    { type: String },
            _holding:      { type: Boolean },
            _holdProgress: { type: Number },
            _micMuted:     { type: Boolean },
            _audioHeld:    { type: Boolean },
            cameraEntity:  { type: String },
            hass:          { type: Object },
        };
    }

    constructor() {
        super();
        this._open = false;
        this._callState = "idle";
        this._holding = false;
        this._holdProgress = 0;
        this._micMuted = false;
        this._audioHeld = false;
        this._holdTimer = null;
        this._holdInterval = null;
        this._cameraCard = null;
        this._sipCore = null;
        this.cameraEntity = null;
        this.hass = null;

        this._onSipUpdate = this._handleSipUpdate.bind(this);
        this._onCallStarted = this._handleCallStarted.bind(this);
        this._onCallEnded = this._handleCallEnded.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("sipcore-update", this._onSipUpdate);
        window.addEventListener("sipcore-call-started", this._onCallStarted);
        window.addEventListener("sipcore-call-ended", this._onCallEnded);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("sipcore-update", this._onSipUpdate);
        window.removeEventListener("sipcore-call-started", this._onCallStarted);
        window.removeEventListener("sipcore-call-ended", this._onCallEnded);
    }

    // ── SIP-Core event handlers ───────────────────────────────────────────────

    _handleSipUpdate() {
        this._sipCore = window.sipCore;
        if (this._sipCore?.hass) {
            this.hass = this._sipCore.hass;
            if (this._cameraCard) this._cameraCard.hass = this._sipCore.hass;
        }
        this.requestUpdate();
    }

    _handleCallStarted() {
        this._sipCore = window.sipCore;
        // Pick up camera_entity from SIP-Core config if not set via card config
        if (!this.cameraEntity) {
            this.cameraEntity = this._sipCore?.config?.popup_config?.camera_entity || null;
        }
        if (!this.hass && this._sipCore?.hass) {
            this.hass = this._sipCore.hass;
        }
        this._callState = "ringing";
        this._open = true;
        // Reset camera card if entity changed or not yet created
        if (!this._cameraCard || this._cameraCardEntity !== this.cameraEntity) {
            this._cameraCard = null;
        }
        this._ensureCameraCard();
        // Auto-close if Asterisk timeout fires before user answers
        this._ringTimeout = setTimeout(() => {
            if (this._callState === "ringing") this._handleCallEnded();
        }, 35000);
    }

    _handleCallEnded() {
        clearTimeout(this._ringTimeout);
        this._callState = "ended";
        setTimeout(() => {
            this._callState = "idle";
            this._open = false;
        }, 2000);
    }

    // ── Public: open manually (dashboard button) ──────────────────────────────

    openManual() {
        this._sipCore = window.sipCore;
        this._open = true;
        this._ensureCameraCard();
    }

    // ── Camera ────────────────────────────────────────────────────────────────

    async _ensureCameraCard() {
        if (this._cameraCard || !window.loadCardHelpers) return;

        const sipCore = window.sipCore;
        const entity =
            this.cameraEntity ||
            sipCore?.config?.popup_config?.camera_entity;

        if (!entity) return;

        const hass = this.hass || sipCore?.hass;
        if (!hass) {
            setTimeout(() => this._ensureCameraCard(), 500);
            return;
        }

        const helpers = await window.loadCardHelpers();
        this._cameraCard = await helpers.createCardElement({
            type: "custom:advanced-camera-card",
            cameras: [{ camera_entity: entity }],
            live: { show_image_during_load: true },
            menu: { mode: "none" },
            dimensions: { aspect_ratio: "16:9" },
        });

        this._cameraCardEntity = entity;
        this._cameraCard.hass = hass;
        this.requestUpdate();
    }

    // ── Call actions ──────────────────────────────────────────────────────────

    async _answer() {
        if (!this._sipCore) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === "suspended") await ctx.resume();
            await this._sipCore.answerCall();
            this._callState = "active";
        } catch (e) {
            console.error("[doorbell] answer failed:", e);
        }
    }

    _hangup() {
        clearTimeout(this._ringTimeout);
        if (this._sipCore) this._sipCore.endCall();
        this._callState = "idle";
        this._open = false;
    }

    _close() {
        // If a call is in progress, end it; otherwise just close
        if (this._callState === "ringing" || this._callState === "active") {
            this._hangup();
        } else {
            this._open = false;
        }
    }

    _toggleMic() {
        if (!this._sipCore) return;
        // Mute/unmute outgoing audio track (microphone)
        const session = this._sipCore.RTCSession;
        if (session?.connection) {
            const senders = session.connection.getSenders();
            const audioSender = senders.find(s => s.track?.kind === "audio");
            if (audioSender?.track) {
                audioSender.track.enabled = this._micMuted; // toggling: if was muted, re-enable
                this._micMuted = !audioSender.track.enabled;
            } else {
                // Fallback: outgoingAudio element
                const out = this._sipCore.outgoingAudio;
                if (out) {
                    out.muted = !out.muted;
                    this._micMuted = out.muted;
                }
            }
        }
        this.requestUpdate();
    }

    _toggleAudio() {
        if (!this._sipCore) return;
        // Mute/unmute incoming audio (speaker)
        const audio = this._sipCore.incomingAudio;
        if (audio) {
            audio.muted = !audio.muted;
            this._audioHeld = audio.muted;
        }
        this.requestUpdate();
    }

    // ── Gate (hold to open) ───────────────────────────────────────────────────

    _gateStart(e) {
        e.preventDefault();
        this._holding = true;
        this._holdProgress = 0;

        const holdMs = (this._sipCore?.config?.popup_config?.gate_hold_time || 2) * 1000;
        const tickMs = 50;
        const steps = holdMs / tickMs;

        this._holdInterval = setInterval(() => {
            this._holdProgress = Math.min(100, this._holdProgress + (100 / steps));
            this.requestUpdate();
        }, tickMs);

        this._holdTimer = setTimeout(() => {
            this._openGate();
            this._gateEnd();
        }, holdMs);
    }

    _gateEnd() {
        clearTimeout(this._holdTimer);
        clearInterval(this._holdInterval);
        this._holding = false;
        this._holdProgress = 0;
    }

    async _openGate() {
        const entity = this._sipCore?.config?.popup_config?.gate_entity;
        if (!entity) return;
        const domain = entity.split(".")[0];
        const service = domain === "button" ? "press" : domain === "lock" ? "unlock" : "turn_on";
        this._sipCore.hass.callService(domain, service, { entity_id: entity });
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        if (this._sipCore?.config?.popup_config?.close_on_gate && this._callState === "active") {
            setTimeout(() => this._hangup(), 500);
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────

    _renderBottomBar() {
        const isRinging = this._callState === "ringing";
        const isActive = this._callState === "active";
        const isEnded = this._callState === "ended";

        // Gate button with circular progress
        const gateButton = html`
            <div class="gate-wrap">
                <svg class="gate-progress" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="20" fill="none" stroke="var(--divider-color)" stroke-width="2"/>
                    <circle cx="22" cy="22" r="20" fill="none"
                        stroke="var(--warning-color, #f4b400)"
                        stroke-width="2"
                        stroke-dasharray="${2 * Math.PI * 20}"
                        stroke-dashoffset="${2 * Math.PI * 20 * (1 - this._holdProgress / 100)}"
                        transform="rotate(-90 22 22)"
                        style="transition: stroke-dashoffset 0.05s linear"
                    />
                </svg>
                <ha-icon-button
                    class="btn gate-btn"
                    @mousedown=${this._gateStart}
                    @mouseup=${this._gateEnd}
                    @mouseleave=${this._gateEnd}
                    @touchstart=${this._gateStart}
                    @touchend=${this._gateEnd}
                >
                    <ha-icon icon="mdi:gate"></ha-icon>
                </ha-icon-button>
            </div>
        `;

        if (isEnded) {
            return html`<div class="bottom-bar ended">Chiamata terminata</div>`;
        }

        if (isRinging) {
            return html`
                <div class="bottom-bar">
                    <ha-icon-button class="btn deny-btn" @click=${this._hangup}>
                        <ha-icon icon="mdi:phone-hangup"></ha-icon>
                    </ha-icon-button>
                    ${gateButton}
                    <ha-icon-button class="btn accept-btn" @click=${this._answer}>
                        <ha-icon icon="mdi:phone"></ha-icon>
                    </ha-icon-button>
                </div>
            `;
        }

        const micButton = html`
            <ha-icon-button class="btn ctrl-btn ${this._micMuted ? 'muted' : ''}" @click=${this._toggleMic}>
                <ha-icon icon="${this._micMuted ? 'mdi:microphone-off' : 'mdi:microphone'}"></ha-icon>
            </ha-icon-button>
        `;

        const audioButton = html`
            <ha-icon-button class="btn ctrl-btn ${this._audioHeld ? 'muted' : ''}" @click=${this._toggleAudio}>
                <ha-icon icon="${this._audioHeld ? 'mdi:volume-off' : 'mdi:volume-high'}"></ha-icon>
            </ha-icon-button>
        `;

        if (isActive) {
            return html`
                <div class="bottom-bar">
                    <ha-icon-button class="btn deny-btn" @click=${this._hangup}>
                        <ha-icon icon="mdi:phone-hangup"></ha-icon>
                    </ha-icon-button>
                    ${gateButton}
                    ${micButton}
                    ${audioButton}
                </div>
            `;
        }

        // Manual open — no active call
        return html`
            <div class="bottom-bar">
                ${gateButton}
                ${micButton}
                ${audioButton}
            </div>
        `;
    }

    render() {
        return html`
            <ha-dialog ?open=${this._open} @closed=${this._close} hideActions flexContent>
                <ha-dialog-header slot="heading">
                    <ha-icon-button slot="navigationIcon" @click=${this._close}>
                        <ha-icon icon="mdi:close"></ha-icon>
                    </ha-icon-button>
                    <span slot="title" class="title ${this._callState}">
                        ${this._callState === "ringing" ? html`<ha-icon class="ring-icon" icon="mdi:phone-ring"></ha-icon> Chiamata in arrivo` :
                          this._callState === "active"  ? html`<ha-icon icon="mdi:phone-in-talk"></ha-icon> In chiamata` :
                          this._callState === "ended"   ? html`<ha-icon icon="mdi:phone-hangup"></ha-icon> Chiamata terminata` :
                          html`<ha-icon icon="mdi:doorbell-video"></ha-icon> Videocitofono`}
                    </span>
                </ha-dialog-header>

                <div class="content">
                    <div class="camera-wrap">
                        ${this._cameraCard || html`<div class="camera-placeholder"><ha-icon icon="mdi:camera-off"></ha-icon></div>`}
                    </div>
                    ${this._renderBottomBar()}
                </div>
            </ha-dialog>
        `;
    }

    static get styles() {
        return css`
            ha-dialog {
                --mdc-dialog-min-width: min(560px, 96vw);
                --dialog-content-padding: 0;
            }
            .title {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .title.ringing {
                color: var(--success-color, #4caf50);
            }
            .title.ended {
                color: var(--secondary-text-color);
            }
            @keyframes ring-pulse {
                0%, 100% { transform: rotate(-15deg); }
                25% { transform: rotate(15deg); }
                50% { transform: rotate(-10deg); }
                75% { transform: rotate(10deg); }
            }
            .ring-icon {
                display: inline-flex;
                animation: ring-pulse 0.6s ease-in-out infinite;
                transform-origin: top center;
            }
            .content {
                display: flex;
                flex-direction: column;
                width: 100%;
            }
            .camera-wrap {
                width: 100%;
                background: #000;
                aspect-ratio: 16 / 9;
                overflow: hidden;
            }
            .camera-wrap > * {
                width: 100%;
                height: 100%;
            }
            .camera-placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                color: #555;
                --mdc-icon-size: 48px;
            }
            .bottom-bar {
                display: flex;
                justify-content: space-around;
                align-items: center;
                padding: 16px;
                border-top: 1px solid var(--divider-color);
                min-height: 80px;
            }
            .bottom-bar.ended {
                justify-content: center;
                color: var(--secondary-text-color);
                font-size: 14px;
            }
            .btn {
                --mdc-icon-button-size: 64px;
                --mdc-icon-size: 32px;
                border-radius: 50%;
            }
            .accept-btn {
                color: white;
                background: var(--success-color, #4caf50);
            }
            .deny-btn {
                color: white;
                background: var(--error-color, #f44336);
            }
            .gate-wrap {
                position: relative;
                width: 64px;
                height: 64px;
            }
            .gate-progress {
                position: absolute;
                top: 0; left: 0;
                width: 64px;
                height: 64px;
                pointer-events: none;
            }
            .gate-btn {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                --mdc-icon-button-size: 56px;
                --mdc-icon-size: 28px;
                color: var(--warning-color, #f4b400);
            }
            .ctrl-btn {
                --mdc-icon-button-size: 48px;
                --mdc-icon-size: 24px;
                color: var(--primary-text-color);
            }
            .ctrl-btn.muted {
                color: var(--secondary-text-color);
                opacity: 0.5;
            }
        `;
    }
}

customElements.define("hikvision-doorbell-dialog", HikvisionDoorbellDialog);

// ── Trigger button (opzionale — aggiunge icona nella toolbar HA) ──────────────
// Rimosso: usa la card Lovelace qui sotto per aprire il popup manualmente.

// ── Lovelace card per aprire il popup manualmente ─────────────────────────────

class HikvisionDoorbellButton extends LitElement {

    static get styles() {
        return css`
            :host { display: block; }
            ha-card {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                cursor: pointer;
                gap: 12px;
            }
            ha-icon { --mdc-icon-size: 28px; color: var(--primary-color); }
            span { font-size: 16px; font-weight: 500; }
        `;
    }

    setConfig(config) {
        this._config = config;
    }

    set hass(hass) {
        this._hass = hass;
    }

    render() {
        return html`
            <ha-card @click=${this._open}>
                <ha-icon icon="mdi:doorbell-video"></ha-icon>
                <span>Videocitofono</span>
            </ha-card>
        `;
    }

    _open() {
        let dialog = document.querySelector("hikvision-doorbell-dialog");
        if (!dialog) {
            dialog = document.createElement("hikvision-doorbell-dialog");
            document.body.appendChild(dialog);
        }
        if (this._config?.camera_entity) {
            dialog.cameraEntity = this._config.camera_entity;
        }
        if (this._hass) {
            dialog.hass = this._hass;
        }
        dialog.openManual();
    }
}

customElements.define("hikvision-doorbell-button", HikvisionDoorbellButton);

// ── Ensure dialog exists in DOM for SIP-Core auto-popup ───────────────────────
// SIP-Core cerca un elemento con il tag definito in popup_override_component.
// Deve esistere nel DOM prima che arrivi la chiamata.
window.addEventListener("load", () => {
    if (!document.querySelector("hikvision-doorbell-dialog")) {
        const el = document.createElement("hikvision-doorbell-dialog");
        document.body.appendChild(el);
    }
});
