import { LitElement, html, css, type TemplateResult, type CSSResult } from "lit";
import { property, state } from "lit/decorators.js";

// ── Types ──────────────────────────────────────────────────────────────────────

type PopupSize = "small" | "large";
type PopupPosition = "center" | "bottom-left" | "bottom-right";

interface PopupConfig {
    camera_entity?: string;
    gate_entity?: string;
    gate_hold_time?: number;
    close_on_gate?: boolean;
    popup_size?: PopupSize;
    popup_position?: PopupPosition;
}

interface SipCoreConfig {
    popup_config?: PopupConfig;
}

interface SipCoreRTCSession {
    connection?: RTCPeerConnection;
}

interface SipCoreInstance {
    hass?: HomeAssistant;
    config?: SipCoreConfig;
    RTCSession?: SipCoreRTCSession;
    incomingAudio?: HTMLAudioElement;
    outgoingAudio?: HTMLAudioElement;
    remoteAudioStream?: MediaStream;
    answerCall(): Promise<void>;
    endCall(): void;
}

interface HomeAssistant {
    callService(domain: string, service: string, data: Record<string, unknown>): void;
}

interface CardConfig {
    camera_entity?: string;
    hide_button?: boolean;
    button_label?: string;
}

declare const __CARD_VERSION__: string;

declare global {
    interface Window {
        sipCore?: SipCoreInstance;
        loadCardHelpers?: () => Promise<{ createCardElement(config: Record<string, unknown>): Promise<HTMLElement> }>;
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
    }
}

type CallState = "idle" | "ringing" | "active" | "ended";

// ── State machine ─────────────────────────────────────────────────────────────
// idle    → popup closed, no call
// ringing → incoming call, popup open, waiting for user action
// active  → call answered
// ended   → call finished, popup auto-closes after 2s

class HikvisionDoorbellDialog extends LitElement {

    @property({ type: Boolean }) _open = false;
    @property({ type: String }) _callState: CallState = "idle";
    @property({ type: Boolean }) _holding = false;
    @property({ type: Number }) _holdProgress = 0;
    @property({ type: Boolean }) _micMuted = false;
    @property({ type: Boolean }) _audioHeld = false;
    @property({ type: String }) cameraEntity: string | null = null;
    @property({ type: Object }) hass: HomeAssistant | null = null;

    private _holdTimer: ReturnType<typeof setTimeout> | null = null;
    private _holdInterval: ReturnType<typeof setInterval> | null = null;
    private _ringTimeout: ReturnType<typeof setTimeout> | null = null;
    private _cameraCard: HTMLElement | null = null;
    private _cameraCardEntity: string | null = null;
    private _sipCore: SipCoreInstance | null = null;

    private _onSipUpdate = this._handleSipUpdate.bind(this);
    private _onCallStarted = this._handleCallStarted.bind(this);
    private _onCallEnded = this._handleCallEnded.bind(this);

    connectedCallback(): void {
        super.connectedCallback();
        window.addEventListener("sipcore-update", this._onSipUpdate);
        window.addEventListener("sipcore-call-started", this._onCallStarted);
        window.addEventListener("sipcore-call-ended", this._onCallEnded);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        window.removeEventListener("sipcore-update", this._onSipUpdate);
        window.removeEventListener("sipcore-call-started", this._onCallStarted);
        window.removeEventListener("sipcore-call-ended", this._onCallEnded);
    }

    // ── SIP-Core event handlers ───────────────────────────────────────────────

    private _handleSipUpdate(): void {
        this._sipCore = window.sipCore ?? null;
        if (this._sipCore?.hass) {
            this.hass = this._sipCore.hass;
            if (this._cameraCard) (this._cameraCard as LitElement & { hass: HomeAssistant }).hass = this._sipCore.hass;
        }
        this.requestUpdate();
    }

    private _handleCallStarted(): void {
        this._sipCore = window.sipCore ?? null;
        if (!this.cameraEntity) {
            this.cameraEntity = this._sipCore?.config?.popup_config?.camera_entity ?? null;
        }
        if (!this.hass && this._sipCore?.hass) {
            this.hass = this._sipCore.hass;
        }
        this._callState = "ringing";
        this._open = true;
        if (!this._cameraCard || this._cameraCardEntity !== this.cameraEntity) {
            this._cameraCard = null;
        }
        this._ensureCameraCard();
        // Auto-close if Asterisk timeout fires before user answers
        this._ringTimeout = setTimeout(() => {
            if (this._callState === "ringing") this._handleCallEnded();
        }, 35000);
    }

    private _handleCallEnded(): void {
        if (this._ringTimeout) clearTimeout(this._ringTimeout);
        this._callState = "ended";
        setTimeout(() => {
            this._callState = "idle";
            this._open = false;
        }, 2000);
    }

    // ── Public: open manually (dashboard button) ──────────────────────────────

    openManual(): void {
        this._sipCore = window.sipCore ?? null;
        this._open = true;
        this._ensureCameraCard();
    }

    // ── Camera ────────────────────────────────────────────────────────────────

    private async _ensureCameraCard(): Promise<void> {
        if (this._cameraCard || !window.loadCardHelpers) return;

        const sipCore = window.sipCore;
        const entity = this.cameraEntity ?? sipCore?.config?.popup_config?.camera_entity;
        if (!entity) return;

        const hass = this.hass ?? sipCore?.hass;
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
        (this._cameraCard as LitElement & { hass: HomeAssistant }).hass = hass;
        this.requestUpdate();
    }

    // ── Call actions ──────────────────────────────────────────────────────────

    private async _answer(): Promise<void> {
        if (!this._sipCore) return;
        try {
            const AudioCtx = window.AudioContext ?? window.webkitAudioContext;
            if (AudioCtx) {
                const ctx = new AudioCtx();
                if (ctx.state === "suspended") await ctx.resume();
            }
            await this._sipCore.answerCall();
            this._callState = "active";
        } catch (e) {
            console.error("[doorbell] answer failed:", e);
        }
    }

    private _hangup(): void {
        if (this._ringTimeout) clearTimeout(this._ringTimeout);
        if (this._sipCore) this._sipCore.endCall();
        this._callState = "idle";
        this._open = false;
    }

    private _close(): void {
        if (this._callState === "ringing" || this._callState === "active") {
            this._hangup();
        } else {
            this._open = false;
        }
    }

    private _toggleMic(): void {
        if (!this._sipCore) return;
        const session = this._sipCore.RTCSession;
        if (session?.connection) {
            const senders = session.connection.getSenders();
            const audioSender = senders.find(s => s.track?.kind === "audio");
            if (audioSender?.track) {
                audioSender.track.enabled = this._micMuted;
                this._micMuted = !audioSender.track.enabled;
            } else {
                const out = this._sipCore.outgoingAudio;
                if (out) {
                    out.muted = !out.muted;
                    this._micMuted = out.muted;
                }
            }
        }
        this.requestUpdate();
    }

    private _toggleAudio(): void {
        if (!this._sipCore) return;
        const stream = this._sipCore.remoteAudioStream;
        if (stream) {
            const enabled = this._audioHeld; // if was muted, re-enable
            stream.getAudioTracks().forEach(t => { t.enabled = enabled; });
            this._audioHeld = !enabled;
        }
        this.requestUpdate();
    }

    // ── Gate (hold to open) ───────────────────────────────────────────────────

    private _gateStart(e: Event): void {
        e.preventDefault();
        this._holding = true;
        this._holdProgress = 0;

        const holdMs = (this._sipCore?.config?.popup_config?.gate_hold_time ?? 2) * 1000;
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

    private _gateEnd(): void {
        if (this._holdTimer) clearTimeout(this._holdTimer);
        if (this._holdInterval) clearInterval(this._holdInterval);
        this._holding = false;
        this._holdProgress = 0;
    }

    private _openGate(): void {
        const entity = this._sipCore?.config?.popup_config?.gate_entity;
        if (!entity) return;
        const domain = entity.split(".")[0];
        const service = domain === "button" ? "press" : domain === "lock" ? "unlock" : "turn_on";
        this._sipCore!.hass!.callService(domain, service, { entity_id: entity });
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        if (this._sipCore?.config?.popup_config?.close_on_gate && this._callState === "active") {
            setTimeout(() => this._hangup(), 500);
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────

    private _renderBottomBar(): TemplateResult {
        const isRinging = this._callState === "ringing";
        const isActive = this._callState === "active";
        const isEnded = this._callState === "ended";

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
            <ha-icon-button class="btn ctrl-btn ${this._micMuted ? "muted" : ""}" @click=${this._toggleMic}>
                <ha-icon icon="${this._micMuted ? "mdi:microphone-off" : "mdi:microphone"}"></ha-icon>
            </ha-icon-button>
        `;

        const audioButton = html`
            <ha-icon-button class="btn ctrl-btn ${this._audioHeld ? "muted" : ""}" @click=${this._toggleAudio}>
                <ha-icon icon="${this._audioHeld ? "mdi:volume-off" : "mdi:volume-high"}"></ha-icon>
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

        return html`
            <div class="bottom-bar">
                ${gateButton}
                ${micButton}
                ${audioButton}
            </div>
        `;
    }

    private get _popupSize(): PopupSize {
        return this._sipCore?.config?.popup_config?.popup_size ?? "large";
    }

    private get _popupPosition(): PopupPosition {
        return this._sipCore?.config?.popup_config?.popup_position ?? "center";
    }

    render(): TemplateResult {
        const position = this._popupPosition;
        const isAnchored = position !== "center";

        if (isAnchored) {
            return html`
                <div class="anchored-overlay ${position} size-${this._popupSize} ${this._open ? "open" : ""}">
                    <div class="anchored-dialog">
                        <div class="anchored-header">
                            <span class="title ${this._callState}">
                                ${this._callState === "ringing" ? html`<ha-icon class="ring-icon" icon="mdi:phone-ring"></ha-icon> Chiamata in arrivo` :
                                  this._callState === "active"  ? html`<ha-icon icon="mdi:phone-in-talk"></ha-icon> In chiamata` :
                                  this._callState === "ended"   ? html`<ha-icon icon="mdi:phone-hangup"></ha-icon> Chiamata terminata` :
                                  html`<ha-icon icon="mdi:doorbell-video"></ha-icon> Videocitofono`}
                            </span>
                            <ha-icon-button @click=${this._close}>
                                <ha-icon icon="mdi:close"></ha-icon>
                            </ha-icon-button>
                        </div>
                        <div class="content">
                            <div class="camera-wrap">
                                ${this._cameraCard ?? html`<div class="camera-placeholder"><ha-icon icon="mdi:camera-off"></ha-icon></div>`}
                            </div>
                            ${this._renderBottomBar()}
                        </div>
                    </div>
                </div>
            `;
        }

        return html`
            <ha-dialog ?open=${this._open} @closed=${this._close} hideActions flexContent
                class="size-${this._popupSize}">
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
                        ${this._cameraCard ?? html`<div class="camera-placeholder"><ha-icon icon="mdi:camera-off"></ha-icon></div>`}
                    </div>
                    ${this._renderBottomBar()}
                </div>
            </ha-dialog>
        `;
    }

    static get styles(): CSSResult {
        return css`
            /* ── Center dialog (default) ── */
            ha-dialog {
                --mdc-dialog-min-width: min(560px, 96vw);
                --dialog-content-padding: 0;
            }
            ha-dialog.size-small {
                --mdc-dialog-min-width: min(320px, 96vw);
            }

            /* ── Anchored overlay (bottom-left / bottom-right) ── */
            .anchored-overlay {
                display: none;
                position: fixed;
                bottom: 24px;
                z-index: 9999;
                pointer-events: none;
            }
            .anchored-overlay.open {
                display: block;
                pointer-events: auto;
            }
            .anchored-overlay.bottom-left  { left: 24px; }
            .anchored-overlay.bottom-right { right: 24px; }
            .anchored-dialog {
                background: var(--card-background-color, #fff);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                overflow: hidden;
                width: 320px;
            }
            .anchored-overlay.size-large .anchored-dialog { width: 420px; }
            .anchored-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 8px 8px 16px;
                border-bottom: 1px solid var(--divider-color);
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

// ── Lovelace card per aprire il popup manualmente ─────────────────────────────

class HikvisionDoorbellButton extends LitElement {

    private _config: CardConfig = {};
    private _hass: HomeAssistant | null = null;

    static get styles(): CSSResult {
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
            :host([hide-button]) ha-card { display: none; }
        `;
    }

    static getStubConfig(): CardConfig {
        return { hide_button: false, button_label: "Videocitofono" };
    }

    static getConfigElement(): HTMLElement {
        return document.createElement("hikvision-doorbell-button-editor");
    }

    setConfig(config: CardConfig): void {
        this._config = config;
    }

    set hass(hass: HomeAssistant) {
        this._hass = hass;
    }

    render(): TemplateResult {
        if (this._config?.hide_button) {
            return html``;
        }
        const label = this._config?.button_label ?? "Videocitofono";
        return html`
            <ha-card @click=${this._open}>
                <ha-icon icon="mdi:doorbell-video"></ha-icon>
                <span>${label}</span>
            </ha-card>
        `;
    }

    private _open(): void {
        let dialog = document.querySelector<HikvisionDoorbellDialog & { cameraEntity: string | null; hass: HomeAssistant | null; openManual(): void }>("hikvision-doorbell-dialog");
        if (!dialog) {
            dialog = document.createElement("hikvision-doorbell-dialog") as typeof dialog;
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

// ── Visual config editor ───────────────────────────────────────────────────────

class HikvisionDoorbellButtonEditor extends LitElement {
    @property({ attribute: false }) config: CardConfig = {};

    setConfig(config: CardConfig): void {
        this.config = config;
    }

    private _changed(e: Event): void {
        const target = e.target as HTMLInputElement;
        const key = target.dataset.key as keyof CardConfig;
        const value = target.type === "checkbox" ? target.checked : target.value;
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config: { ...this.config, [key]: value } },
            bubbles: true,
            composed: true,
        }));
    }

    render(): TemplateResult {
        return html`
            <div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
                <ha-textfield
                    label="Button label"
                    .value=${this.config.button_label ?? "Videocitofono"}
                    data-key="button_label"
                    @change=${this._changed}
                ></ha-textfield>
                <ha-textfield
                    label="Camera entity (optional)"
                    .value=${this.config.camera_entity ?? ""}
                    data-key="camera_entity"
                    @change=${this._changed}
                ></ha-textfield>
                <ha-formfield label="Hide button (popup only on incoming call)">
                    <ha-checkbox
                        .checked=${this.config.hide_button ?? false}
                        data-key="hide_button"
                        @change=${this._changed}
                    ></ha-checkbox>
                </ha-formfield>
            </div>
        `;
    }
}

customElements.define("hikvision-doorbell-button-editor", HikvisionDoorbellButtonEditor);

console.info(
    `%c HIKVISION-DOORBELL-CARD %c v${__CARD_VERSION__} `,
    "color: white; background: #025a9e; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;",
    "color: #025a9e; background: #e8f4fd; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;"
);

// ── Ensure dialog exists in DOM for SIP-Core auto-popup ───────────────────────
window.addEventListener("load", () => {
    if (!document.querySelector("hikvision-doorbell-dialog")) {
        const el = document.createElement("hikvision-doorbell-dialog");
        document.body.appendChild(el);
    }
});
