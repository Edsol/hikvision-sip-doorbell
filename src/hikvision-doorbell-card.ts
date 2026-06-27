import { LitElement, html, css, type TemplateResult, type CSSResult } from "lit";
import { property, state } from "lit/decorators.js";

// ── Types ──────────────────────────────────────────────────────────────────────

type PopupSize = "small" | "medium" | "large";
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
    formatEntityState(stateObj: Record<string, unknown>): string;
}

interface ExtraEntity {
    entity: string;
    icon?: string;
    label?: string;
}

interface CardConfig {
    camera_entity?: string;
    hide_button?: boolean;
    button_label?: string;
    call_state_entity?: string;
    extra_entities?: ExtraEntity[];
    popup_size?: PopupSize;
    popup_position?: PopupPosition;
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
    @property({ type: String }) popupSize: PopupSize | null = null;
    @property({ type: String }) popupPosition: PopupPosition | null = null;

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
        console.debug("[hikvision-dialog] connectedCallback — registering listeners");
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
        console.debug("[hikvision-dialog] sipcore-call-started received, opening popup");
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
            return html`<div class="bottom-bar ended"><ha-icon icon="mdi:phone-hangup"></ha-icon> Chiamata terminata</div>`;
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
        return this.popupSize ?? "medium";
    }

    private get _popupPosition(): PopupPosition {
        return this.popupPosition ?? "center";
    }

    private get _effectivePopupSize(): PopupSize {
        return this._popupPosition === "center" ? this._popupSize : this._popupSize === "large" ? "medium" : this._popupSize;
    }

    updated(): void {
        this._injectDialogSizeStyle();
    }

    private _popupWidth(): string {
        switch (this._effectivePopupSize) {
            case "small":
                return "min(92vw, clamp(360px, 42vw, 560px))";
            case "large":
                return "min(96vw, clamp(720px, 82vw, 1400px))";
            case "medium":
            default:
                return "min(92vw, clamp(560px, 70vw, 1100px))";
        }
    }

    private _injectDialogSizeStyle(attempt = 0): void {
        const haDialog = this.shadowRoot?.querySelector("ha-dialog");
        if (!haDialog) return;

        const width = this._popupWidth();
        haDialog.style.setProperty("--mdc-dialog-min-width", width);
        haDialog.style.setProperty("--mdc-dialog-max-width", width);
        haDialog.style.setProperty("--dialog-surface-width", width);
        haDialog.style.setProperty("--dialog-content-padding", "0");
        haDialog.style.setProperty("width", width);
        haDialog.style.setProperty("max-width", width);

        if (!haDialog.shadowRoot) {
            if (attempt < 10) window.setTimeout(() => this._injectDialogSizeStyle(attempt + 1), 50);
            return;
        }

        const styleId = "hikvision-size-override";
        let haStyle = haDialog.shadowRoot.getElementById(styleId) as HTMLStyleElement | null;
        if (!haStyle) {
            haStyle = document.createElement("style");
            haStyle.id = styleId;
            haDialog.shadowRoot.appendChild(haStyle);
        }
        haStyle.textContent = `
            :host {
                --mdc-dialog-min-width: ${width} !important;
                --mdc-dialog-max-width: ${width} !important;
                --dialog-surface-width: ${width} !important;
                --width: ${width} !important;
                width: ${width} !important;
                max-width: ${width} !important;
            }
            .mdc-dialog__surface {
                width: ${width} !important;
                max-width: ${width} !important;
            }
        `;

        const waDialog = haDialog.shadowRoot.querySelector("wa-dialog") as HTMLElement | null;
        if (!waDialog?.shadowRoot) {
            if (attempt < 10) window.setTimeout(() => this._injectDialogSizeStyle(attempt + 1), 50);
            return;
        }

        waDialog.style.setProperty("--width", width);
        waDialog.style.setProperty("width", width);
        waDialog.style.setProperty("max-width", width);

        let waStyle = waDialog.shadowRoot.getElementById(styleId) as HTMLStyleElement | null;
        if (!waStyle) {
            waStyle = document.createElement("style");
            waStyle.id = styleId;
            waDialog.shadowRoot.appendChild(waStyle);
        }
        waStyle.textContent = `
            :host {
                --width: ${width} !important;
                width: ${width} !important;
                max-width: ${width} !important;
            }
            [part~="dialog"],
            .dialog,
            .dialog__panel {
                width: ${width} !important;
                max-width: ${width} !important;
            }
        `;
    }

    render(): TemplateResult {
        const position = this._popupPosition;
        const isAnchored = position !== "center";
        const size = this._effectivePopupSize;

        if (isAnchored) {
            return html`
                <div class="anchored-overlay ${position} size-${size} ${this._open ? "open" : ""}">
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
                class="size-${size}">
                <div class="content center-content">
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
                --mdc-dialog-min-width: min(92vw, clamp(560px, 70vw, 1100px));
                --mdc-dialog-max-width: min(92vw, clamp(560px, 70vw, 1100px));
                --dialog-surface-width: min(92vw, clamp(560px, 70vw, 1100px));
                --width: min(92vw, clamp(560px, 70vw, 1100px));
                --dialog-content-padding: 0;
                --mdc-dialog-heading-ink-color: var(--primary-text-color);
            }
            ha-dialog.size-small {
                --mdc-dialog-min-width: min(92vw, clamp(360px, 42vw, 560px));
                --mdc-dialog-max-width: min(92vw, clamp(360px, 42vw, 560px));
                --dialog-surface-width: min(92vw, clamp(360px, 42vw, 560px));
                --width: min(92vw, clamp(360px, 42vw, 560px));
            }
            ha-dialog.size-large {
                --mdc-dialog-min-width: min(96vw, clamp(720px, 82vw, 1400px));
                --mdc-dialog-max-width: min(96vw, clamp(720px, 82vw, 1400px));
                --dialog-surface-width: min(96vw, clamp(720px, 82vw, 1400px));
                --width: min(96vw, clamp(720px, 82vw, 1400px));
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
            .anchored-overlay.size-medium .anchored-dialog { width: min(calc(100vw - 48px), clamp(420px, 35vw, 640px)); }
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
                max-width: 100%;
                box-sizing: border-box;
                background: var(--card-background-color, #fff);
                overflow: hidden;
            }
            .center-content {
                padding: 0;
            }
            .camera-wrap {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
                margin: 0;
                background: #000;
                aspect-ratio: 16 / 9;
                overflow: hidden;
                border-radius: 0;
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
                justify-content: center;
                align-items: center;
                gap: clamp(24px, 7vw, 84px);
                padding: 12px 16px 14px;
                min-height: 68px;
                box-sizing: border-box;
                overflow: hidden;
            }
            .bottom-bar.ended {
                justify-content: center;
                gap: 8px;
                color: var(--secondary-text-color);
                font-size: 14px;
                min-height: 56px;
            }
            .bottom-bar.ended ha-icon {
                --mdc-icon-size: 18px;
            }
            .btn {
                --mdc-icon-button-size: 48px;
                --mdc-icon-size: 22px;
                border-radius: 50%;
                color: var(--primary-text-color);
            }
            .accept-btn {
                color: white;
                background: var(--success-color, #4caf50);
                --mdc-icon-button-size: 58px;
                --mdc-icon-size: 28px;
                box-shadow: 0 5px 14px rgba(76, 175, 80, 0.35);
            }
            .deny-btn {
                color: white;
                background: var(--error-color, #f44336);
                --mdc-icon-button-size: 58px;
                --mdc-icon-size: 28px;
                box-shadow: 0 5px 14px rgba(244, 67, 54, 0.32);
            }
            .gate-wrap {
                position: relative;
                width: 56px;
                height: 56px;
            }
            .gate-progress {
                position: absolute;
                inset: 0;
                width: 56px;
                height: 56px;
                pointer-events: none;
            }
            .gate-btn {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                --mdc-icon-button-size: 48px;
                --mdc-icon-size: 24px;
                color: var(--warning-color, #f4b400);
                background: var(--secondary-background-color);
            }
            .ctrl-btn {
                --mdc-icon-button-size: 48px;
                --mdc-icon-size: 22px;
                color: var(--primary-text-color);
                background: var(--secondary-background-color);
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
                flex-direction: column;
                padding: 16px;
                cursor: pointer;
                gap: 12px;
            }
            .main-row {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
            }
            ha-icon { --mdc-icon-size: 28px; color: var(--primary-color); }
            span.label { font-size: 16px; font-weight: 500; }
            ha-icon.ringing {
                animation: ring 0.6s ease-in-out infinite alternate;
                color: var(--error-color, #db4437);
            }
            @keyframes ring {
                from { transform: rotate(-20deg) scale(1.1); }
                to   { transform: rotate(20deg)  scale(1.2); }
            }
            .chips {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: center;
            }
            .chip {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 10px;
                border-radius: 16px;
                background: var(--secondary-background-color);
                font-size: 13px;
                color: var(--primary-text-color);
                cursor: default;
            }
            .chip ha-icon {
                --mdc-icon-size: 16px;
                color: var(--secondary-text-color);
            }
        `;
    }

    static getStubConfig(): CardConfig {
        return { hide_button: false, button_label: "Doorbell", call_state_entity: "" };
    }

    static getConfigElement(): HTMLElement {
        return document.createElement("hikvision-doorbell-button-editor");
    }

    private _onSipCoreUpdate = () => this._applyPopupConfig();

    connectedCallback(): void {
        super.connectedCallback();
        if (!document.querySelector("hikvision-doorbell-dialog")) {
            document.body.appendChild(document.createElement("hikvision-doorbell-dialog"));
        }
        window.addEventListener("sipcore-update", this._onSipCoreUpdate);
        this._applyPopupConfig();
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        window.removeEventListener("sipcore-update", this._onSipCoreUpdate);
    }

    setConfig(config: CardConfig): void {
        this._config = config;
        this._applyPopupConfig();
    }

    private _applyPopupConfig(): void {
        const dialog = document.querySelector("hikvision-doorbell-dialog") as (HikvisionDoorbellDialog & { popupSize: PopupSize | null; popupPosition: PopupPosition | null; cameraEntity: string | null }) | null;
        if (!dialog) return;
        dialog.popupSize = this._config.popup_size ?? null;
        dialog.popupPosition = this._config.popup_position ?? null;
        if (this._config.camera_entity) dialog.cameraEntity = this._config.camera_entity;
    }

    set hass(hass: HomeAssistant) {
        this._hass = hass;
        this.requestUpdate();
    }

    private get _isRinging(): boolean {
        if (!this._hass || !this._config?.call_state_entity) return false;
        return this._hass.states[this._config.call_state_entity]?.state === "ringing";
    }

    private _renderChips(): TemplateResult {
        const entities = this._config?.extra_entities ?? [];
        if (!entities.length || !this._hass) return html``;
        return html`
            <div class="chips" @click=${(e: Event) => e.stopPropagation()}>
                ${entities.map(({ entity, icon, label }) => {
                    const stateObj = this._hass!.states[entity];
                    if (!stateObj) return html``;
                    const displayIcon = icon || stateObj.attributes.icon || "mdi:dots-horizontal";
                    const formattedState = this._hass!.formatEntityState
                        ? this._hass!.formatEntityState(stateObj as unknown as Record<string, unknown>)
                        : stateObj.state;
                    const displayText = label
                        ? `${label}: ${formattedState}`
                        : formattedState;
                    return html`
                        <div class="chip">
                            <ha-icon icon=${displayIcon}></ha-icon>
                            <span>${displayText}</span>
                        </div>
                    `;
                })}
            </div>
        `;
    }

    render(): TemplateResult {
        if (this._config?.hide_button) {
            return html``;
        }
        const label = this._config?.button_label ?? "Doorbell";
        const ringing = this._isRinging;
        return html`
            <ha-card @click=${this._open}>
                <div class="main-row">
                    <ha-icon
                        class=${ringing ? "ringing" : ""}
                        icon=${ringing ? "mdi:doorbell" : "mdi:doorbell-video"}
                    ></ha-icon>
                    <span class="label">${label}</span>
                </div>
                ${this._renderChips()}
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
    @property({ attribute: false }) hass?: HomeAssistant;

    static get styles(): CSSResult {
        return css`
            .form { padding: 16px; display: flex; flex-direction: column; gap: 24px; }
            .row { display: flex; flex-direction: column; gap: 4px; }
            .section-label {
                font-size: 12px; font-weight: 500; color: var(--secondary-text-color);
                text-transform: uppercase; letter-spacing: 0.4px;
            }
            .section-title {
                font-size: 14px; font-weight: 500; color: var(--primary-text-color);
                padding-top: 8px; border-top: 1px solid var(--divider-color);
            }
            .extra-entity-row {
                display: grid;
                grid-template-columns: 1fr auto;
                grid-template-rows: auto auto;
                gap: 6px 8px;
                align-items: center;
            }
            .extra-entity-row ha-selector { grid-column: 1; }
            .extra-entity-row .delete-btn { grid-column: 2; grid-row: 1 / 3; align-self: center; }
            .extra-entity-row .sub-row {
                grid-column: 1;
                display: flex;
                gap: 8px;
            }
            .extra-entity-row .sub-row ha-selector { flex: 1; }
            ha-icon-button { --mdc-icon-button-size: 36px; --mdc-icon-size: 20px; }
            .add-btn {
                display: flex; align-items: center; gap: 4px;
                color: var(--primary-color); cursor: pointer;
                font-size: 14px; padding: 4px 0;
                background: none; border: none;
            }
            .add-btn ha-icon { --mdc-icon-size: 20px; color: var(--primary-color); }
        `;
    }

    setConfig(config: CardConfig): void {
        this.config = config;
    }

    private _emit(newConfig: CardConfig): void {
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        }));
    }

    private _selectorChanged(key: keyof CardConfig, e: CustomEvent): void {
        const nextConfig = { ...this.config, [key]: e.detail.value };
        if (
            key === "popup_position" &&
            e.detail.value !== "center" &&
            nextConfig.popup_size === "large"
        ) {
            nextConfig.popup_size = "medium";
        }
        this._emit(nextConfig);
    }

    private _extraEntityChanged(index: number, field: keyof ExtraEntity, e: CustomEvent): void {
        const entities = [...(this.config.extra_entities ?? [])];
        entities[index] = { ...entities[index], [field]: e.detail.value };
        this._emit({ ...this.config, extra_entities: entities });
    }

    private _addExtraEntity(): void {
        const entities = [...(this.config.extra_entities ?? []), { entity: "", icon: "" }];
        this._emit({ ...this.config, extra_entities: entities });
    }

    private _removeExtraEntity(index: number): void {
        const entities = (this.config.extra_entities ?? []).filter((_, i) => i !== index);
        this._emit({ ...this.config, extra_entities: entities });
    }

    render(): TemplateResult {
        const extras = this.config.extra_entities ?? [];
        const popupPosition = this.config.popup_position ?? "center";
        const popupSizeOptions = popupPosition === "center"
            ? [
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
            ]
            : [
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
            ];
        const popupSizeValue = popupPosition === "center"
            ? this.config.popup_size ?? "medium"
            : this.config.popup_size === "large" ? "medium" : this.config.popup_size ?? "medium";

        return html`
            <div class="form">
                <div class="row">
                    <div class="section-label">Button label</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{ text: {} }}
                        .value=${this.config.button_label ?? "Doorbell"}
                        @value-changed=${(e: CustomEvent) => this._selectorChanged("button_label", e)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Call state entity (ringing animation)</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{ entity: { domain: "sensor" } }}
                        .value=${this.config.call_state_entity ?? ""}
                        @value-changed=${(e: CustomEvent) => this._selectorChanged("call_state_entity", e)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Camera entity (optional)</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{ entity: { domain: "camera" } }}
                        .value=${this.config.camera_entity ?? ""}
                        @value-changed=${(e: CustomEvent) => this._selectorChanged("camera_entity", e)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Popup position</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{ select: { options: [
                            { value: "center", label: "Center" },
                            { value: "bottom-left", label: "Bottom left" },
                            { value: "bottom-right", label: "Bottom right" },
                        ], mode: "dropdown" } }}
                        .value=${popupPosition}
                        @value-changed=${(e: CustomEvent) => this._selectorChanged("popup_position", e)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Popup size</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{ select: { options: popupSizeOptions, mode: "dropdown" } }}
                        .value=${popupSizeValue}
                        @value-changed=${(e: CustomEvent) => this._selectorChanged("popup_size", e)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{ boolean: {} }}
                        .value=${this.config.hide_button ?? false}
                        .label=${"Hide button (popup only on incoming call)"}
                        @value-changed=${(e: CustomEvent) => this._selectorChanged("hide_button", e)}
                    ></ha-selector>
                </div>

                <div class="row">
                    <div class="section-title">Extra entities (shown as chips)</div>
                    ${extras.map((item, i) => html`
                        <div class="extra-entity-row">
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{ entity: {} }}
                                .value=${item.entity}
                                @value-changed=${(e: CustomEvent) => this._extraEntityChanged(i, "entity", e)}
                            ></ha-selector>
                            <ha-icon-button class="delete-btn" @click=${() => this._removeExtraEntity(i)}>
                                <ha-icon icon="mdi:delete"></ha-icon>
                            </ha-icon-button>
                            <div class="sub-row">
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{ icon: {} }}
                                    .value=${item.icon ?? ""}
                                    @value-changed=${(e: CustomEvent) => this._extraEntityChanged(i, "icon", e)}
                                ></ha-selector>
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{ text: {} }}
                                    .value=${item.label ?? ""}
                                    .placeholder=${"Label (optional)"}
                                    @value-changed=${(e: CustomEvent) => this._extraEntityChanged(i, "label", e)}
                                ></ha-selector>
                            </div>
                        </div>
                    `)}
                    <button class="add-btn" @click=${this._addExtraEntity}>
                        <ha-icon icon="mdi:plus"></ha-icon> Add entity
                    </button>
                </div>
            </div>
        `;
    }
}

customElements.define("hikvision-doorbell-button-editor", HikvisionDoorbellButtonEditor);

// ── Ensure dialog exists in DOM as early as possible for SIP-Core auto-popup ──
// Using both strategies: immediately on script load, and again on window.load
// (HA loads cards asynchronously — window.load may fire before cards mount)
function _ensureDialog(): void {
    if (!document.querySelector("hikvision-doorbell-dialog")) {
        console.debug("[hikvision-dialog] creating dialog element in DOM");
        document.body.appendChild(document.createElement("hikvision-doorbell-dialog"));
    } else {
        console.debug("[hikvision-dialog] dialog already in DOM, skipping");
    }
}
if (document.body) {
    _ensureDialog();
} else {
    window.addEventListener("load", _ensureDialog, { once: true });
}

console.info(
    `%c HIKVISION-DOORBELL-CARD %c v${__CARD_VERSION__} `,
    "color: white; background: #025a9e; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;",
    "color: #025a9e; background: #e8f4fd; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;"
);
