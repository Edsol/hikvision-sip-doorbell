var $t=Object.defineProperty;var xt=Object.getOwnPropertyDescriptor;var g=(r,e,t,i)=>{for(var o=i>1?void 0:i?xt(e,t):e,n=r.length-1,s;n>=0;n--)(s=r[n])&&(o=(i?s(e,t,o):s(o))||o);return i&&o&&$t(e,t,o),o};var j=globalThis,N=j.ShadowRoot&&(j.ShadyCSS===void 0||j.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,V=Symbol(),st=new WeakMap,P=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==V)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(N&&e===void 0){let i=t!==void 0&&t.length===1;i&&(e=st.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&st.set(t,e))}return e}toString(){return this.cssText}},nt=r=>new P(typeof r=="string"?r:r+"",void 0,V),z=(r,...e)=>{let t=r.length===1?r[0]:e.reduce((i,o,n)=>i+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+r[n+1],r[0]);return new P(t,r,V)},rt=(r,e)=>{if(N)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let i=document.createElement("style"),o=j.litNonce;o!==void 0&&i.setAttribute("nonce",o),i.textContent=t.cssText,r.appendChild(i)}},G=N?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(let i of e.cssRules)t+=i.cssText;return nt(t)})(r):r;var{is:Ct,defineProperty:St,getOwnPropertyDescriptor:Et,getOwnPropertyNames:At,getOwnPropertySymbols:Pt,getPrototypeOf:zt}=Object,q=globalThis,at=q.trustedTypes,Mt=at?at.emptyScript:"",Rt=q.reactiveElementPolyfillSupport,M=(r,e)=>r,R={toAttribute(r,e){switch(e){case Boolean:r=r?Mt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},B=(r,e)=>!Ct(r,e),lt={attribute:!0,type:String,converter:R,reflect:!1,useDefault:!1,hasChanged:B};Symbol.metadata??=Symbol("metadata"),q.litPropertyMetadata??=new WeakMap;var b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=lt){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let i=Symbol(),o=this.getPropertyDescriptor(e,i,t);o!==void 0&&St(this.prototype,e,o)}}static getPropertyDescriptor(e,t,i){let{get:o,set:n}=Et(this.prototype,e)??{get(){return this[t]},set(s){this[t]=s}};return{get:o,set(s){let l=o?.call(this);n?.call(this,s),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??lt}static _$Ei(){if(this.hasOwnProperty(M("elementProperties")))return;let e=zt(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(M("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(M("properties"))){let t=this.properties,i=[...At(t),...Pt(t)];for(let o of i)this.createProperty(o,t[o])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[i,o]of t)this.elementProperties.set(i,o)}this._$Eh=new Map;for(let[t,i]of this.elementProperties){let o=this._$Eu(t,i);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let o of i)t.unshift(G(o))}else e!==void 0&&t.push(G(e));return t}static _$Eu(e,t){let i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return rt(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){let i=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,i);if(o!==void 0&&i.reflect===!0){let n=(i.converter?.toAttribute!==void 0?i.converter:R).toAttribute(t,i.type);this._$Em=e,n==null?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(e,t){let i=this.constructor,o=i._$Eh.get(e);if(o!==void 0&&this._$Em!==o){let n=i.getPropertyOptions(o),s=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:R;this._$Em=o;let l=s.fromAttribute(t,n.type);this[o]=l??this._$Ej?.get(o)??l,this._$Em=null}}requestUpdate(e,t,i,o=!1,n){if(e!==void 0){let s=this.constructor;if(o===!1&&(n=this[e]),i??=s.getPropertyOptions(e),!((i.hasChanged??B)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:o,wrapped:n},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),n!==!0||s!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),o===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,n]of this._$Ep)this[o]=n;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[o,n]of i){let{wrapped:s}=n,l=this[o];s!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,n,l)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[M("elementProperties")]=new Map,b[M("finalized")]=new Map,Rt?.({ReactiveElement:b}),(q.reactiveElementVersions??=[]).push("2.1.2");var Y=globalThis,ct=r=>r,D=Y.trustedTypes,dt=D?D.createPolicy("lit-html",{createHTML:r=>r}):void 0,_t="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,ft="?"+w,kt=`<${ft}>`,C=document,T=()=>C.createComment(""),O=r=>r===null||typeof r!="object"&&typeof r!="function",tt=Array.isArray,Tt=r=>tt(r)||typeof r?.[Symbol.iterator]=="function",F=`[ 	
\f\r]`,k=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ht=/-->/g,pt=/>/g,$=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ut=/'/g,mt=/"/g,vt=/^(?:script|style|textarea|title)$/i,et=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),d=et(1),Wt=et(2),Vt=et(3),S=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),gt=new WeakMap,x=C.createTreeWalker(C,129);function bt(r,e){if(!tt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return dt!==void 0?dt.createHTML(e):e}var Ot=(r,e)=>{let t=r.length-1,i=[],o,n=e===2?"<svg>":e===3?"<math>":"",s=k;for(let l=0;l<t;l++){let a=r[l],c,p,h=-1,v=0;for(;v<a.length&&(s.lastIndex=v,p=s.exec(a),p!==null);)v=s.lastIndex,s===k?p[1]==="!--"?s=ht:p[1]!==void 0?s=pt:p[2]!==void 0?(vt.test(p[2])&&(o=RegExp("</"+p[2],"g")),s=$):p[3]!==void 0&&(s=$):s===$?p[0]===">"?(s=o??k,h=-1):p[1]===void 0?h=-2:(h=s.lastIndex-p[2].length,c=p[1],s=p[3]===void 0?$:p[3]==='"'?mt:ut):s===mt||s===ut?s=$:s===ht||s===pt?s=k:(s=$,o=void 0);let y=s===$&&r[l+1].startsWith("/>")?" ":"";n+=s===k?a+kt:h>=0?(i.push(c),a.slice(0,h)+_t+a.slice(h)+w+y):a+w+(h===-2?l:y)}return[bt(r,n+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]},U=class r{constructor({strings:e,_$litType$:t},i){let o;this.parts=[];let n=0,s=0,l=e.length-1,a=this.parts,[c,p]=Ot(e,t);if(this.el=r.createElement(c,i),x.currentNode=this.el.content,t===2||t===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(o=x.nextNode())!==null&&a.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(let h of o.getAttributeNames())if(h.endsWith(_t)){let v=p[s++],y=o.getAttribute(h).split(w),I=/([.?@])?(.*)/.exec(v);a.push({type:1,index:n,name:I[2],strings:y,ctor:I[1]==="."?J:I[1]==="?"?Z:I[1]==="@"?Q:A}),o.removeAttribute(h)}else h.startsWith(w)&&(a.push({type:6,index:n}),o.removeAttribute(h));if(vt.test(o.tagName)){let h=o.textContent.split(w),v=h.length-1;if(v>0){o.textContent=D?D.emptyScript:"";for(let y=0;y<v;y++)o.append(h[y],T()),x.nextNode(),a.push({type:2,index:++n});o.append(h[v],T())}}}else if(o.nodeType===8)if(o.data===ft)a.push({type:2,index:n});else{let h=-1;for(;(h=o.data.indexOf(w,h+1))!==-1;)a.push({type:7,index:n}),h+=w.length-1}n++}}static createElement(e,t){let i=C.createElement("template");return i.innerHTML=e,i}};function E(r,e,t=r,i){if(e===S)return e;let o=i!==void 0?t._$Co?.[i]:t._$Cl,n=O(e)?void 0:e._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),n===void 0?o=void 0:(o=new n(r),o._$AT(r,t,i)),i!==void 0?(t._$Co??=[])[i]=o:t._$Cl=o),o!==void 0&&(e=E(r,o._$AS(r,e.values),o,i)),e}var K=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:i}=this._$AD,o=(e?.creationScope??C).importNode(t,!0);x.currentNode=o;let n=x.nextNode(),s=0,l=0,a=i[0];for(;a!==void 0;){if(s===a.index){let c;a.type===2?c=new H(n,n.nextSibling,this,e):a.type===1?c=new a.ctor(n,a.name,a.strings,this,e):a.type===6&&(c=new X(n,this,e)),this._$AV.push(c),a=i[++l]}s!==a?.index&&(n=x.nextNode(),s++)}return x.currentNode=C,o}p(e){let t=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},H=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,o){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=E(this,e,t),O(e)?e===u||e==null||e===""?(this._$AH!==u&&this._$AR(),this._$AH=u):e!==this._$AH&&e!==S&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Tt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==u&&O(this._$AH)?this._$AA.nextSibling.data=e:this.T(C.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:i}=e,o=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=U.createElement(bt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(t);else{let n=new K(o,this),s=n.u(this.options);n.p(t),this.T(s),this._$AH=n}}_$AC(e){let t=gt.get(e.strings);return t===void 0&&gt.set(e.strings,t=new U(e)),t}k(e){tt(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,o=0;for(let n of e)o===t.length?t.push(i=new r(this.O(T()),this.O(T()),this,this.options)):i=t[o],i._$AI(n),o++;o<t.length&&(this._$AR(i&&i._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let i=ct(e).nextSibling;ct(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},A=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,o,n){this.type=1,this._$AH=u,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=u}_$AI(e,t=this,i,o){let n=this.strings,s=!1;if(n===void 0)e=E(this,e,t,0),s=!O(e)||e!==this._$AH&&e!==S,s&&(this._$AH=e);else{let l=e,a,c;for(e=n[0],a=0;a<n.length-1;a++)c=E(this,l[i+a],t,a),c===S&&(c=this._$AH[a]),s||=!O(c)||c!==this._$AH[a],c===u?e=u:e!==u&&(e+=(c??"")+n[a+1]),this._$AH[a]=c}s&&!o&&this.j(e)}j(e){e===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},J=class extends A{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===u?void 0:e}},Z=class extends A{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==u)}},Q=class extends A{constructor(e,t,i,o,n){super(e,t,i,o,n),this.type=5}_$AI(e,t=this){if((e=E(this,e,t,0)??u)===S)return;let i=this._$AH,o=e===u&&i!==u||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==u&&(i===u||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},X=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){E(this,e)}};var Ut=Y.litHtmlPolyfillSupport;Ut?.(U,H),(Y.litHtmlVersions??=[]).push("3.3.3");var yt=(r,e,t)=>{let i=t?.renderBefore??e,o=i._$litPart$;if(o===void 0){let n=t?.renderBefore??null;i._$litPart$=o=new H(e.insertBefore(T(),n),n,void 0,t??{})}return o._$AI(r),o};var it=globalThis,f=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=yt(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};f._$litElement$=!0,f.finalized=!0,it.litElementHydrateSupport?.({LitElement:f});var Ht=it.litElementPolyfillSupport;Ht?.({LitElement:f});(it.litElementVersions??=[]).push("4.2.2");var Lt={attribute:!0,type:String,converter:R,reflect:!1,hasChanged:B},It=(r=Lt,e,t)=>{let{kind:i,metadata:o}=t,n=globalThis.litPropertyMetadata.get(o);if(n===void 0&&globalThis.litPropertyMetadata.set(o,n=new Map),i==="setter"&&((r=Object.create(r)).wrapped=!0),n.set(t.name,r),i==="accessor"){let{name:s}=t;return{set(l){let a=e.get.call(this);e.set.call(this,l),this.requestUpdate(s,a,r,!0,l)},init(l){return l!==void 0&&this.C(s,void 0,r,l),l}}}if(i==="setter"){let{name:s}=t;return function(l){let a=this[s];e.call(this,l),this.requestUpdate(s,a,r,!0,l)}}throw Error("Unsupported decorator location: "+i)};function m(r){return(e,t)=>typeof t=="object"?It(r,e,t):((i,o,n)=>{let s=o.hasOwnProperty(n);return o.constructor.createProperty(n,i),s?Object.getOwnPropertyDescriptor(o,n):void 0})(r,e,t)}var _=class extends f{constructor(){super(...arguments);this._open=!1;this._callState="idle";this._holding=!1;this._holdProgress=0;this._micMuted=!1;this._audioHeld=!1;this.cameraEntity=null;this.go2rtcUrl=null;this.go2rtcStream=null;this.hass=null;this.popupSize=null;this.popupPosition=null;this.gateOpenMode=null;this._holdTimer=null;this._holdInterval=null;this._ringTimeout=null;this._cameraCard=null;this._cameraCardEntity=null;this._sipCore=null;this._cameraResizeObserver=null;this._onSipUpdate=this._handleSipUpdate.bind(this);this._onCallStarted=this._handleCallStarted.bind(this);this._onCallEnded=this._handleCallEnded.bind(this);this._onResize=()=>{this._open&&(this._injectDialogSizeStyle(),this._nudgeCameraCardResize())}}_nudgeCameraCardResize(){this._cameraCard&&requestAnimationFrame(()=>requestAnimationFrame(()=>{this._cameraCard?.dispatchEvent(new Event("resize"))}))}connectedCallback(){super.connectedCallback(),console.debug("[hikvision-dialog] connectedCallback \u2014 registering listeners"),window.addEventListener("sipcore-update",this._onSipUpdate),window.addEventListener("sipcore-call-started",this._onCallStarted),window.addEventListener("sipcore-call-ended",this._onCallEnded),window.addEventListener("resize",this._onResize)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("sipcore-update",this._onSipUpdate),window.removeEventListener("sipcore-call-started",this._onCallStarted),window.removeEventListener("sipcore-call-ended",this._onCallEnded),window.removeEventListener("resize",this._onResize),this._cameraResizeObserver?.disconnect(),this._cameraResizeObserver=null}_handleSipUpdate(){this._sipCore=window.sipCore??null,this._sipCore?.hass&&(this.hass=this._sipCore.hass,this._cameraCard&&(this._cameraCard.hass=this._sipCore.hass)),this.requestUpdate()}_handleCallStarted(){console.debug("[hikvision-dialog] sipcore-call-started received, opening popup"),this._sipCore=window.sipCore??null,this.cameraEntity||(this.cameraEntity=this._sipCore?.config?.popup_config?.camera_entity??null),!this.hass&&this._sipCore?.hass&&(this.hass=this._sipCore.hass),this._callState="ringing",this._open=!0,(!this._cameraCard||this._cameraCardEntity!==this.cameraEntity)&&(this._cameraCard=null),this._ensureCameraCard(),this._ringTimeout=setTimeout(()=>{this._callState==="ringing"&&this._handleCallEnded()},35e3)}_handleCallEnded(){this._ringTimeout&&clearTimeout(this._ringTimeout),this._callState="ended",setTimeout(()=>{this._callState="idle",this._open=!1,this._teardownCameraCard()},2e3)}openManual(){this._sipCore=window.sipCore??null,this._micMuted=!0,this._audioHeld=!1,this._open=!0,this._ensureCameraCard(),setTimeout(()=>{this._triggerCameraAction("microphone_mute"),this._triggerCameraAction("unmute")},1500)}get _deviceSlug(){let t=this.cameraEntity??this._sipCore?.config?.popup_config?.camera_entity;return t&&t.split(".")[1]||null}_doorbellEntity(t,i){let o=this._deviceSlug;if(!o)return null;let n=`${t}.${o}_${i}`;return(this.hass??this._sipCore?.hass)?.states[n]?n:null}_pressDoorbellButton(t){let i=this._doorbellEntity("button",t),o=this.hass??this._sipCore?.hass;return!i||!o?!1:(o.callService("button","press",{entity_id:i}),!0)}_sendIsapi(t){let i=this._doorbellEntity("text","isapi_request"),o=this.hass??this._sipCore?.hass;return!i||!o?!1:(o.callService("text","set_value",{entity_id:i,value:t}),!0)}_sleep(t){return new Promise(i=>setTimeout(i,t))}async _ensureCameraCard(){if(this._cameraCard||!window.loadCardHelpers)return;let t=window.sipCore,i=this.cameraEntity??t?.config?.popup_config?.camera_entity;if(!i)return;let o=this.hass??t?.hass;if(!o){setTimeout(()=>this._ensureCameraCard(),500);return}let n=this.go2rtcStream??this._sipCore?.config?.popup_config?.go2rtc_stream??this._deviceSlug,s=this.go2rtcUrl??this._sipCore?.config?.popup_config?.go2rtc_url??(n?`http://${window.location.hostname}:1984`:null),l=s&&n?{live_provider:"go2rtc",go2rtc:{url:s,stream:n},proxy:{live:!0,dynamic:!0}}:{camera_entity:i},a=await window.loadCardHelpers();this._cameraCard=await a.createCardElement({type:"custom:advanced-camera-card",cameras:[l],view:{default:"live"},live:{show_image_during_load:!0,controls:{builtin:!1,title:{mode:"none"}},microphone:{always_connected:!0,mute_after_microphone_mute_seconds:90},auto_mute:[],auto_unmute:[]},media_viewer:{controls:{builtin:!1}},menu:{style:"none",buttons:{microphone:{enabled:!0,type:"toggle"},mute:{enabled:!0}}},status_bar:{style:"none"},dimensions:{aspect_ratio_mode:"unconstrained"}}),this._cameraCardEntity=i,this._cameraCard.hass=o,this.requestUpdate()}async _answer(){if(this._sipCore)try{let t=window.AudioContext??window.webkitAudioContext;if(t){let i=new t;i.state==="suspended"&&await i.resume()}await this._sipCore.answerCall(),this._micMuted=!1,this._audioHeld=!1,this._callState="active"}catch(t){console.error("[doorbell] answer failed:",t)}}_hangup(){this._ringTimeout&&clearTimeout(this._ringTimeout),this._sipCore&&this._sipCore.endCall(),this._callState="idle",this._open=!1,this._teardownCameraCard()}_close(){if(this._callState==="ringing"||this._callState==="active"){this._hangup();return}this._triggerCameraAction("microphone_mute"),this._triggerCameraAction("microphone_disconnect"),this._sendIsapi("PUT /ISAPI/System/TwoWayAudio/channels/1/close"),this._teardownCameraCard(),this._micMuted=!0,this._audioHeld=!1,this._open=!1}_teardownCameraCard(){this._cameraCard&&(this._cameraCard.remove(),this._cameraCard=null,this._cameraCardEntity=null)}async _toggleMic(){let t=!this._micMuted;if(this._callState==="active"&&this._sipCore){let i=this._sipCore.RTCSession;if(i?.connection){let n=i.connection.getSenders().find(s=>s.track?.kind==="audio");if(n?.track)n.track.enabled=!t;else{let s=this._sipCore.outgoingAudio;s&&(s.muted=t)}}this._micMuted=t,this.requestUpdate();return}this._micMuted=t,this.requestUpdate(),t?(this._triggerCameraAction("microphone_mute"),this._sendIsapi("PUT /ISAPI/System/TwoWayAudio/channels/1/close")):(this._triggerCameraAction("microphone_unmute"),this._pressDoorbellButton("answer_call"),await this._sleep(300),this._pressDoorbellButton("hangup_call"),await this._sleep(200),this._triggerCameraAction("microphone_unmute"))}_toggleAudio(){let t=!this._audioHeld;if(this._callState==="active"&&this._sipCore){let i=this._sipCore.remoteAudioStream;i&&i.getAudioTracks().forEach(o=>{o.enabled=!t}),this._sipCore.incomingAudio&&(this._sipCore.incomingAudio.muted=t)}else this._setCameraMediaMuted(t),this._triggerCameraAction(t?"mute":"unmute");this._audioHeld=t,this.requestUpdate()}_setCameraMediaMuted(t){let i=this._getCameraMediaElements();return i.forEach(o=>{o.muted=t;let n=o.srcObject;n instanceof MediaStream&&n.getAudioTracks().forEach(s=>{s.enabled=!t})}),i.length>0}_getCameraMediaElements(){if(!this._cameraCard)return[];let t=[];return this._walkElements(this._cameraCard,i=>{i instanceof HTMLMediaElement&&t.push(i)}),t}_clickCameraControl(t){if(!this._cameraCard)return!1;let i=!1;return this._walkElements(this._cameraCard,o=>{if(i||!(o instanceof HTMLElement))return;let n=[o.getAttribute("aria-label"),o.getAttribute("title"),o.getAttribute("label"),o.textContent,o.getAttribute("icon"),o.querySelector("ha-icon")?.getAttribute("icon")].filter(Boolean).join(" ").toLowerCase();t.some(s=>n.includes(s))&&(o.click(),i=!0)}),i}_triggerCameraAction(t){this._cameraCard&&this._cameraCard.dispatchEvent(new CustomEvent("advanced-camera-card:action:execution-request",{bubbles:!0,composed:!0,detail:{actions:[{action:"fire-dom-event",advanced_camera_card_action:t}]}}))}_walkElements(t,i){let o=new WeakSet,n=[{node:t,depth:0}],s=12;for(;n.length;){let{node:l,depth:a}=n.pop();if(o.has(l)||a>s)continue;o.add(l),l instanceof Element&&i(l);let c=Array.from(l.children);for(let p=c.length-1;p>=0;p-=1)n.push({node:c[p],depth:a+1});l instanceof Element&&l.shadowRoot&&!o.has(l.shadowRoot)&&n.push({node:l.shadowRoot,depth:a+1})}}get _gateOpenMode(){return this.gateOpenMode??"hold"}_gateClick(t){this._gateOpenMode==="direct"&&(t.preventDefault(),t.stopPropagation(),this._openGate())}_gateStart(t){if(this._gateOpenMode!=="hold")return;t.preventDefault(),this._holding=!0,this._holdProgress=0;let i=(this._sipCore?.config?.popup_config?.gate_hold_time??2)*1e3,o=50,n=i/o;this._holdInterval=setInterval(()=>{this._holdProgress=Math.min(100,this._holdProgress+100/n),this.requestUpdate()},o),this._holdTimer=setTimeout(()=>{this._openGate(),this._gateEnd()},i)}_gateEnd(){this._gateOpenMode==="hold"&&(this._holdTimer&&clearTimeout(this._holdTimer),this._holdInterval&&clearInterval(this._holdInterval),this._holding=!1,this._holdProgress=0)}_openGate(){let t=this._sipCore?.config?.popup_config?.gate_entity;if(!t)return;let i=t.split(".")[0],o=i==="button"?"press":i==="lock"?"unlock":"turn_on";this._sipCore.hass.callService(i,o,{entity_id:t}),navigator.vibrate&&navigator.vibrate([100,50,100]),this._sipCore?.config?.popup_config?.close_on_gate&&this._callState==="active"&&setTimeout(()=>this._hangup(),500)}_renderBottomBar(){let t=this._callState==="ringing",i=this._callState==="active",o=this._callState==="ended",n=this._gateOpenMode==="direct",s=i?!!this._sipCore:!t&&!o,l=d`
            <div class="gate-wrap ${n?"direct":"hold"}">
                ${n?"":d`
                    <svg class="gate-progress" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="20" fill="none" stroke="var(--divider-color)" stroke-width="2"/>
                        <circle cx="22" cy="22" r="20" fill="none"
                            stroke="var(--warning-color, #f4b400)"
                            stroke-width="2"
                            stroke-dasharray="${2*Math.PI*20}"
                            stroke-dashoffset="${2*Math.PI*20*(1-this._holdProgress/100)}"
                            transform="rotate(-90 22 22)"
                            style="transition: stroke-dashoffset 0.05s linear"
                        />
                    </svg>
                `}
                <ha-icon-button
                    class="btn gate-btn"
                    @click=${this._gateClick}
                    @mousedown=${this._gateStart}
                    @mouseup=${this._gateEnd}
                    @mouseleave=${this._gateEnd}
                    @touchstart=${this._gateStart}
                    @touchend=${this._gateEnd}
                >
                    <ha-icon icon="mdi:gate"></ha-icon>
                </ha-icon-button>
            </div>
        `;if(o)return d`<div class="bottom-bar ended"><ha-icon icon="mdi:phone-hangup"></ha-icon> Chiamata terminata</div>`;if(t)return d`
                <div class="bottom-bar">
                    <ha-icon-button class="btn deny-btn" @click=${this._hangup}>
                        <ha-icon icon="mdi:phone-hangup"></ha-icon>
                    </ha-icon-button>
                    ${l}
                    <ha-icon-button class="btn accept-btn" @click=${this._answer}>
                        <ha-icon icon="mdi:phone"></ha-icon>
                    </ha-icon-button>
                </div>
            `;let a=d`
            <ha-icon-button
                class="btn ctrl-btn ${this._micMuted?"muted":""} ${s?"":"unavailable"}"
                ?disabled=${!s}
                @click=${this._toggleMic}
            >
                <ha-icon icon="${this._micMuted?"mdi:microphone-off":"mdi:microphone"}"></ha-icon>
            </ha-icon-button>
        `,c=d`
            <ha-icon-button
                class="btn ctrl-btn ${this._audioHeld?"muted":""} ${s?"":"unavailable"}"
                ?disabled=${!s}
                @click=${this._toggleAudio}
            >
                <ha-icon icon="${this._audioHeld?"mdi:volume-off":"mdi:volume-high"}"></ha-icon>
            </ha-icon-button>
        `;return i?d`
                <div class="bottom-bar">
                    <ha-icon-button class="btn deny-btn" @click=${this._hangup}>
                        <ha-icon icon="mdi:phone-hangup"></ha-icon>
                    </ha-icon-button>
                    ${l}
                    ${a}
                    ${c}
                </div>
            `:d`
            <div class="bottom-bar manual">
                ${l}
                ${a}
                ${c}
            </div>
        `}get _popupSize(){return this.popupSize??"medium"}get _popupPosition(){return this.popupPosition??"center"}get _effectivePopupSize(){return this._popupPosition==="center"?this._popupSize:this._popupSize==="large"?"medium":this._popupSize}updated(){this._injectDialogSizeStyle();let t=this.hass??this._sipCore?.hass??null;this._cameraCard&&t&&(this._cameraCard.hass=t),this._observeCameraWrap()}_observeCameraWrap(){let t=this.shadowRoot?.querySelector(".camera-wrap");t&&(this._cameraResizeObserver?this._cameraResizeObserver.disconnect():this._cameraResizeObserver=new ResizeObserver(()=>this._nudgeCameraCardResize()),this._cameraResizeObserver.observe(t))}_popupWidth(){switch(this._effectivePopupSize){case"small":return"min(92vw, clamp(360px, 42vw, 560px))";case"large":return"min(96vw, clamp(720px, 82vw, 1400px))";case"medium":default:return"min(92vw, clamp(560px, 70vw, 1100px))"}}_injectDialogSizeStyle(t=0){let i=this.shadowRoot?.querySelector("ha-dialog");if(!i)return;if(window.matchMedia("(max-width: 600px)").matches){i.style.removeProperty("width"),i.style.removeProperty("max-width"),i.style.setProperty("--dialog-content-padding","0");return}let o=this._popupWidth();if(i.style.setProperty("--mdc-dialog-min-width",o),i.style.setProperty("--mdc-dialog-max-width",o),i.style.setProperty("--dialog-surface-width",o),i.style.setProperty("--dialog-content-padding","0"),i.style.setProperty("width",o),i.style.setProperty("max-width",o),!i.shadowRoot){t<10&&window.setTimeout(()=>this._injectDialogSizeStyle(t+1),50);return}let n="hikvision-size-override",s=i.shadowRoot.getElementById(n);s||(s=document.createElement("style"),s.id=n,i.shadowRoot.appendChild(s)),s.textContent=`
            :host {
                --mdc-dialog-min-width: ${o} !important;
                --mdc-dialog-max-width: ${o} !important;
                --dialog-surface-width: ${o} !important;
                --width: ${o} !important;
                width: ${o} !important;
                max-width: ${o} !important;
            }
            .mdc-dialog__surface {
                width: ${o} !important;
                max-width: ${o} !important;
            }
        `;let l=i.shadowRoot.querySelector("wa-dialog");if(!l?.shadowRoot){t<10&&window.setTimeout(()=>this._injectDialogSizeStyle(t+1),50);return}l.style.setProperty("--width",o),l.style.setProperty("width",o),l.style.setProperty("max-width",o);let a=l.shadowRoot.getElementById(n);a||(a=document.createElement("style"),a.id=n,l.shadowRoot.appendChild(a)),a.textContent=`
            :host {
                --width: ${o} !important;
                width: ${o} !important;
                max-width: ${o} !important;
            }
            [part~="dialog"],
            .dialog,
            .dialog__panel {
                width: ${o} !important;
                max-width: ${o} !important;
            }
        `}render(){let t=this._popupPosition,i=t!=="center",o=this._effectivePopupSize;return i?d`
                <div class="anchored-overlay ${t} size-${o} ${this._open?"open":""}">
                    <div class="anchored-dialog">
                        <div class="anchored-header">
                            <span class="title ${this._callState}">
                                ${this._callState==="ringing"?d`<ha-icon class="ring-icon" icon="mdi:phone-ring"></ha-icon> Chiamata in arrivo`:this._callState==="active"?d`<ha-icon icon="mdi:phone-in-talk"></ha-icon> In chiamata`:this._callState==="ended"?d`<ha-icon icon="mdi:phone-hangup"></ha-icon> Chiamata terminata`:d`<ha-icon icon="mdi:doorbell-video"></ha-icon> Videocitofono`}
                            </span>
                            <ha-icon-button @click=${this._close}>
                                <ha-icon icon="mdi:close"></ha-icon>
                            </ha-icon-button>
                        </div>
                        <div class="content">
                            <div class="camera-wrap">
                                ${this._cameraCard??d`<div class="camera-placeholder"><ha-icon icon="mdi:camera-off"></ha-icon></div>`}
                            </div>
                            ${this._renderBottomBar()}
                        </div>
                    </div>
                </div>
            `:d`
            <ha-dialog ?open=${this._open} @closed=${this._close} hideActions flexContent
                class="size-${o}">
                <div class="content center-content">
                    <div class="camera-wrap">
                        ${this._cameraCard??d`<div class="camera-placeholder"><ha-icon icon="mdi:camera-off"></ha-icon></div>`}
                    </div>
                    ${this._renderBottomBar()}
                </div>
            </ha-dialog>
        `}static get styles(){return z`
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
            /* Mobile / narrow screens: below ~600px HA renders ha-dialog
               fullscreen, so the surface is full-height while our content stays
               glued to the top with a large empty area below. Center the video +
               controls vertically and let the video fill the width. */
            @media (max-width: 600px) {
                .content.center-content {
                    height: 100%;
                    min-height: 100dvh;
                    justify-content: center;
                }
                .center-content .camera-wrap {
                    aspect-ratio: 16 / 9;
                    max-height: 70dvh;
                }
                .center-content .camera-wrap > * {
                    object-fit: contain;
                }
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
            .bottom-bar.manual {
                min-height: 72px;
            }
            .btn {
                --mdc-icon-button-size: 48px;
                --mdc-icon-size: 22px;
                border-radius: 50%;
                color: var(--primary-text-color);
                border: 1px solid rgba(0, 0, 0, 0.08);
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
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
                border-color: rgba(244, 180, 0, 0.28);
            }
            .ctrl-btn {
                --mdc-icon-button-size: 48px;
                --mdc-icon-size: 22px;
                color: white;
                background: var(--success-color, #4caf50);
                border-color: rgba(76, 175, 80, 0.38);
                box-shadow: 0 3px 10px rgba(76, 175, 80, 0.24);
            }
            .ctrl-btn.muted {
                color: white;
                background: var(--error-color, #f44336);
                border-color: rgba(244, 67, 54, 0.38);
                box-shadow: 0 3px 10px rgba(244, 67, 54, 0.28);
            }
            .ctrl-btn.unavailable {
                color: var(--disabled-text-color, rgba(0, 0, 0, 0.38));
                background: var(--disabled-color, rgba(0, 0, 0, 0.12));
                border-color: rgba(0, 0, 0, 0.08);
                box-shadow: none;
                opacity: 1;
            }
            ha-dialog.size-large .bottom-bar {
                gap: clamp(36px, 8vw, 120px);
                padding: 16px 20px 18px;
                min-height: 84px;
            }
            ha-dialog.size-large .btn {
                --mdc-icon-button-size: 56px;
                --mdc-icon-size: 26px;
            }
            ha-dialog.size-large .accept-btn,
            ha-dialog.size-large .deny-btn {
                --mdc-icon-button-size: 68px;
                --mdc-icon-size: 32px;
            }
            ha-dialog.size-large .gate-wrap,
            ha-dialog.size-large .gate-progress {
                width: 66px;
                height: 66px;
            }
            ha-dialog.size-large .gate-btn,
            ha-dialog.size-large .ctrl-btn {
                --mdc-icon-button-size: 56px;
                --mdc-icon-size: 26px;
            }
        `}};g([m({type:Boolean})],_.prototype,"_open",2),g([m({type:String})],_.prototype,"_callState",2),g([m({type:Boolean})],_.prototype,"_holding",2),g([m({type:Number})],_.prototype,"_holdProgress",2),g([m({type:Boolean})],_.prototype,"_micMuted",2),g([m({type:Boolean})],_.prototype,"_audioHeld",2),g([m({type:String})],_.prototype,"cameraEntity",2),g([m({type:String})],_.prototype,"go2rtcUrl",2),g([m({type:String})],_.prototype,"go2rtcStream",2),g([m({type:Object})],_.prototype,"hass",2),g([m({type:String})],_.prototype,"popupSize",2),g([m({type:String})],_.prototype,"popupPosition",2),g([m({type:String})],_.prototype,"gateOpenMode",2);customElements.define("hikvision-doorbell-dialog",_);var ot=class extends f{constructor(){super(...arguments);this._config={};this._hass=null;this._onSipCoreUpdate=()=>this._applyPopupConfig()}static get styles(){return z`
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
        `}static getStubConfig(){return{hide_button:!1,button_label:"Doorbell",call_state_entity:""}}static getConfigElement(){return document.createElement("hikvision-doorbell-button-editor")}connectedCallback(){super.connectedCallback(),document.querySelector("hikvision-doorbell-dialog")||document.body.appendChild(document.createElement("hikvision-doorbell-dialog")),window.addEventListener("sipcore-update",this._onSipCoreUpdate),this._applyPopupConfig()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("sipcore-update",this._onSipCoreUpdate)}setConfig(t){this._config=t,this._applyPopupConfig()}_applyPopupConfig(){let t=document.querySelector("hikvision-doorbell-dialog");t&&(t.popupSize=this._config.popup_size??null,t.popupPosition=this._config.popup_position??null,t.gateOpenMode=this._config.gate_open_mode??null,this._config.camera_entity&&(t.cameraEntity=this._config.camera_entity),t.go2rtcUrl=this._config.go2rtc_url??null,t.go2rtcStream=this._config.go2rtc_stream??null)}set hass(t){this._hass=t,this.requestUpdate()}get _isRinging(){return!this._hass||!this._config?.call_state_entity?!1:this._hass.states[this._config.call_state_entity]?.state==="ringing"}_renderChips(){let t=this._config?.extra_entities??[];return!t.length||!this._hass?d``:d`
            <div class="chips" @click=${i=>i.stopPropagation()}>
                ${t.map(({entity:i,icon:o,label:n})=>{let s=this._hass.states[i];if(!s)return d``;let l=o||s.attributes.icon||"mdi:dots-horizontal",a=this._hass.formatEntityState?this._hass.formatEntityState(s):s.state,c=n?`${n}: ${a}`:a;return d`
                        <div class="chip">
                            <ha-icon icon=${l}></ha-icon>
                            <span>${c}</span>
                        </div>
                    `})}
            </div>
        `}render(){if(this._config?.hide_button)return d``;let t=this._config?.button_label??"Doorbell",i=this._isRinging;return d`
            <ha-card @click=${this._open}>
                <div class="main-row">
                    <ha-icon
                        class=${i?"ringing":""}
                        icon=${i?"mdi:doorbell":"mdi:doorbell-video"}
                    ></ha-icon>
                    <span class="label">${t}</span>
                </div>
                ${this._renderChips()}
            </ha-card>
        `}_open(){let t=document.querySelector("hikvision-doorbell-dialog");t||(t=document.createElement("hikvision-doorbell-dialog"),document.body.appendChild(t)),this._config?.camera_entity&&(t.cameraEntity=this._config.camera_entity),t.go2rtcUrl=this._config.go2rtc_url??null,t.go2rtcStream=this._config.go2rtc_stream??null,t.gateOpenMode=this._config.gate_open_mode??null,this._hass&&(t.hass=this._hass),t.openManual()}};customElements.define("hikvision-doorbell-button",ot);var L=class extends f{constructor(){super(...arguments);this.config={}}static get styles(){return z`
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
        `}setConfig(t){this.config=t}_emit(t){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}_selectorChanged(t,i){let o={...this.config,[t]:i.detail.value};t==="popup_position"&&i.detail.value!=="center"&&o.popup_size==="large"&&(o.popup_size="medium"),this._emit(o)}_extraEntityChanged(t,i,o){let n=[...this.config.extra_entities??[]];n[t]={...n[t],[i]:o.detail.value},this._emit({...this.config,extra_entities:n})}_addExtraEntity(){let t=[...this.config.extra_entities??[],{entity:"",icon:""}];this._emit({...this.config,extra_entities:t})}_removeExtraEntity(t){let i=(this.config.extra_entities??[]).filter((o,n)=>n!==t);this._emit({...this.config,extra_entities:i})}render(){let t=this.config.extra_entities??[],i=this.config.popup_position??"center",o=i==="center"?[{value:"small",label:"Small"},{value:"medium",label:"Medium"},{value:"large",label:"Large"}]:[{value:"small",label:"Small"},{value:"medium",label:"Medium"}],n=i==="center"?this.config.popup_size??"medium":this.config.popup_size==="large"?"medium":this.config.popup_size??"medium";return d`
            <div class="form">
                <div class="row">
                    <div class="section-label">Button label</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{text:{}}}
                        .value=${this.config.button_label??"Doorbell"}
                        @value-changed=${s=>this._selectorChanged("button_label",s)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Call state entity (ringing animation)</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{entity:{domain:"sensor"}}}
                        .value=${this.config.call_state_entity??""}
                        @value-changed=${s=>this._selectorChanged("call_state_entity",s)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Camera entity (optional)</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{entity:{domain:"camera"}}}
                        .value=${this.config.camera_entity??""}
                        @value-changed=${s=>this._selectorChanged("camera_entity",s)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">go2rtc URL (for two-way audio, e.g. http://192.168.1.4:1984)</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{text:{}}}
                        .value=${this.config.go2rtc_url??""}
                        @value-changed=${s=>this._selectorChanged("go2rtc_url",s)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">go2rtc stream name (defaults to camera entity slug)</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{text:{}}}
                        .value=${this.config.go2rtc_stream??""}
                        @value-changed=${s=>this._selectorChanged("go2rtc_stream",s)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Popup position</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{select:{options:[{value:"center",label:"Center"},{value:"bottom-left",label:"Bottom left"},{value:"bottom-right",label:"Bottom right"}],mode:"dropdown"}}}
                        .value=${i}
                        @value-changed=${s=>this._selectorChanged("popup_position",s)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Popup size</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{select:{options:o,mode:"dropdown"}}}
                        .value=${n}
                        @value-changed=${s=>this._selectorChanged("popup_size",s)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Gate open mode</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{select:{options:[{value:"hold",label:"Hold to open"},{value:"direct",label:"Open directly"}],mode:"dropdown"}}}
                        .value=${this.config.gate_open_mode??"hold"}
                        @value-changed=${s=>this._selectorChanged("gate_open_mode",s)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{boolean:{}}}
                        .value=${this.config.hide_button??!1}
                        .label=${"Hide button (popup only on incoming call)"}
                        @value-changed=${s=>this._selectorChanged("hide_button",s)}
                    ></ha-selector>
                </div>

                <div class="row">
                    <div class="section-title">Extra entities (shown as chips)</div>
                    ${t.map((s,l)=>d`
                        <div class="extra-entity-row">
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{entity:{}}}
                                .value=${s.entity}
                                @value-changed=${a=>this._extraEntityChanged(l,"entity",a)}
                            ></ha-selector>
                            <ha-icon-button class="delete-btn" @click=${()=>this._removeExtraEntity(l)}>
                                <ha-icon icon="mdi:delete"></ha-icon>
                            </ha-icon-button>
                            <div class="sub-row">
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{icon:{}}}
                                    .value=${s.icon??""}
                                    @value-changed=${a=>this._extraEntityChanged(l,"icon",a)}
                                ></ha-selector>
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{text:{}}}
                                    .value=${s.label??""}
                                    .placeholder=${"Label (optional)"}
                                    @value-changed=${a=>this._extraEntityChanged(l,"label",a)}
                                ></ha-selector>
                            </div>
                        </div>
                    `)}
                    <button class="add-btn" @click=${this._addExtraEntity}>
                        <ha-icon icon="mdi:plus"></ha-icon> Add entity
                    </button>
                </div>
            </div>
        `}};g([m({attribute:!1})],L.prototype,"config",2),g([m({attribute:!1})],L.prototype,"hass",2);customElements.define("hikvision-doorbell-button-editor",L);function wt(){document.querySelector("hikvision-doorbell-dialog")?console.debug("[hikvision-dialog] dialog already in DOM, skipping"):(console.debug("[hikvision-dialog] creating dialog element in DOM"),document.body.appendChild(document.createElement("hikvision-doorbell-dialog")))}document.body?wt():window.addEventListener("load",wt,{once:!0});console.info("%c HIKVISION-DOORBELL-CARD %c v0.3.8 ","color: white; background: #025a9e; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;","color: #025a9e; background: #e8f4fd; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;");
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/custom-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/property.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/state.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/event-options.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/base.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-all.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-async.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
