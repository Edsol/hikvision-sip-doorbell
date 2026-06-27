var xt=Object.defineProperty;var wt=Object.getOwnPropertyDescriptor;var g=(r,t,e,i)=>{for(var o=i>1?void 0:i?wt(t,e):t,s=r.length-1,n;s>=0;s--)(n=r[s])&&(o=(i?n(t,e,o):n(o))||o);return i&&o&&xt(t,e,o),o};var j=globalThis,I=j.ShadowRoot&&(j.ShadyCSS===void 0||j.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,W=Symbol(),st=new WeakMap,P=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==W)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(I&&t===void 0){let i=e!==void 0&&e.length===1;i&&(t=st.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&st.set(e,t))}return t}toString(){return this.cssText}},nt=r=>new P(typeof r=="string"?r:r+"",void 0,W),k=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((i,o,s)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+r[s+1],r[0]);return new P(e,r,W)},rt=(r,t)=>{if(I)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let i=document.createElement("style"),o=j.litNonce;o!==void 0&&i.setAttribute("nonce",o),i.textContent=e.cssText,r.appendChild(i)}},K=I?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return nt(e)})(r):r;var{is:Ct,defineProperty:St,getOwnPropertyDescriptor:Et,getOwnPropertyNames:At,getOwnPropertySymbols:Pt,getPrototypeOf:kt}=Object,q=globalThis,at=q.trustedTypes,zt=at?at.emptyScript:"",Tt=q.reactiveElementPolyfillSupport,z=(r,t)=>r,T={toAttribute(r,t){switch(t){case Boolean:r=r?zt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},B=(r,t)=>!Ct(r,t),lt={attribute:!0,type:String,converter:T,reflect:!1,useDefault:!1,hasChanged:B};Symbol.metadata??=Symbol("metadata"),q.litPropertyMetadata??=new WeakMap;var y=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=lt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),o=this.getPropertyDescriptor(t,i,e);o!==void 0&&St(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){let{get:o,set:s}=Et(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:o,set(n){let l=o?.call(this);s?.call(this,n),this.requestUpdate(t,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??lt}static _$Ei(){if(this.hasOwnProperty(z("elementProperties")))return;let t=kt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(z("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(z("properties"))){let e=this.properties,i=[...At(e),...Pt(e)];for(let o of i)this.createProperty(o,e[o])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[i,o]of e)this.elementProperties.set(i,o)}this._$Eh=new Map;for(let[e,i]of this.elementProperties){let o=this._$Eu(e,i);o!==void 0&&this._$Eh.set(o,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let i=new Set(t.flat(1/0).reverse());for(let o of i)e.unshift(K(o))}else t!==void 0&&e.push(K(t));return e}static _$Eu(t,e){let i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return rt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(o!==void 0&&i.reflect===!0){let s=(i.converter?.toAttribute!==void 0?i.converter:T).toAttribute(e,i.type);this._$Em=t,s==null?this.removeAttribute(o):this.setAttribute(o,s),this._$Em=null}}_$AK(t,e){let i=this.constructor,o=i._$Eh.get(t);if(o!==void 0&&this._$Em!==o){let s=i.getPropertyOptions(o),n=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:T;this._$Em=o;let l=n.fromAttribute(e,s.type);this[o]=l??this._$Ej?.get(o)??l,this._$Em=null}}requestUpdate(t,e,i,o=!1,s){if(t!==void 0){let n=this.constructor;if(o===!1&&(s=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??B)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:o,wrapped:s},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),s!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),o===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,s]of this._$Ep)this[o]=s;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[o,s]of i){let{wrapped:n}=s,l=this[o];n!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,s,l)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};y.elementStyles=[],y.shadowRootOptions={mode:"open"},y[z("elementProperties")]=new Map,y[z("finalized")]=new Map,Tt?.({ReactiveElement:y}),(q.reactiveElementVersions??=[]).push("2.1.2");var Y=globalThis,ct=r=>r,D=Y.trustedTypes,dt=D?D.createPolicy("lit-html",{createHTML:r=>r}):void 0,_t="$lit$",$=`lit$${Math.random().toFixed(9).slice(2)}$`,ft="?"+$,Rt=`<${ft}>`,C=document,M=()=>C.createComment(""),U=r=>r===null||typeof r!="object"&&typeof r!="function",tt=Array.isArray,Mt=r=>tt(r)||typeof r?.[Symbol.iterator]=="function",F=`[ 	
\f\r]`,R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ht=/-->/g,pt=/>/g,x=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ut=/'/g,mt=/"/g,vt=/^(?:script|style|textarea|title)$/i,et=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),d=et(1),Vt=et(2),Wt=et(3),S=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),gt=new WeakMap,w=C.createTreeWalker(C,129);function yt(r,t){if(!tt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return dt!==void 0?dt.createHTML(t):t}var Ut=(r,t)=>{let e=r.length-1,i=[],o,s=t===2?"<svg>":t===3?"<math>":"",n=R;for(let l=0;l<e;l++){let a=r[l],h,u,c=-1,v=0;for(;v<a.length&&(n.lastIndex=v,u=n.exec(a),u!==null);)v=n.lastIndex,n===R?u[1]==="!--"?n=ht:u[1]!==void 0?n=pt:u[2]!==void 0?(vt.test(u[2])&&(o=RegExp("</"+u[2],"g")),n=x):u[3]!==void 0&&(n=x):n===x?u[0]===">"?(n=o??R,c=-1):u[1]===void 0?c=-2:(c=n.lastIndex-u[2].length,h=u[1],n=u[3]===void 0?x:u[3]==='"'?mt:ut):n===mt||n===ut?n=x:n===ht||n===pt?n=R:(n=x,o=void 0);let b=n===x&&r[l+1].startsWith("/>")?" ":"";s+=n===R?a+Rt:c>=0?(i.push(h),a.slice(0,c)+_t+a.slice(c)+$+b):a+$+(c===-2?l:b)}return[yt(r,s+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]},O=class r{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let s=0,n=0,l=t.length-1,a=this.parts,[h,u]=Ut(t,e);if(this.el=r.createElement(h,i),w.currentNode=this.el.content,e===2||e===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(o=w.nextNode())!==null&&a.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(let c of o.getAttributeNames())if(c.endsWith(_t)){let v=u[n++],b=o.getAttribute(c).split($),N=/([.?@])?(.*)/.exec(v);a.push({type:1,index:s,name:N[2],strings:b,ctor:N[1]==="."?J:N[1]==="?"?Z:N[1]==="@"?Q:A}),o.removeAttribute(c)}else c.startsWith($)&&(a.push({type:6,index:s}),o.removeAttribute(c));if(vt.test(o.tagName)){let c=o.textContent.split($),v=c.length-1;if(v>0){o.textContent=D?D.emptyScript:"";for(let b=0;b<v;b++)o.append(c[b],M()),w.nextNode(),a.push({type:2,index:++s});o.append(c[v],M())}}}else if(o.nodeType===8)if(o.data===ft)a.push({type:2,index:s});else{let c=-1;for(;(c=o.data.indexOf($,c+1))!==-1;)a.push({type:7,index:s}),c+=$.length-1}s++}}static createElement(t,e){let i=C.createElement("template");return i.innerHTML=t,i}};function E(r,t,e=r,i){if(t===S)return t;let o=i!==void 0?e._$Co?.[i]:e._$Cl,s=U(t)?void 0:t._$litDirective$;return o?.constructor!==s&&(o?._$AO?.(!1),s===void 0?o=void 0:(o=new s(r),o._$AT(r,e,i)),i!==void 0?(e._$Co??=[])[i]=o:e._$Cl=o),o!==void 0&&(t=E(r,o._$AS(r,t.values),o,i)),t}var G=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,o=(t?.creationScope??C).importNode(e,!0);w.currentNode=o;let s=w.nextNode(),n=0,l=0,a=i[0];for(;a!==void 0;){if(n===a.index){let h;a.type===2?h=new H(s,s.nextSibling,this,t):a.type===1?h=new a.ctor(s,a.name,a.strings,this,t):a.type===6&&(h=new X(s,this,t)),this._$AV.push(h),a=i[++l]}n!==a?.index&&(s=w.nextNode(),n++)}return w.currentNode=C,o}p(t){let e=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}},H=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,o){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=E(this,t,e),U(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==S&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Mt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(C.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,o=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=O.createElement(yt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(e);else{let s=new G(o,this),n=s.u(this.options);s.p(e),this.T(n),this._$AH=s}}_$AC(t){let e=gt.get(t.strings);return e===void 0&&gt.set(t.strings,e=new O(t)),e}k(t){tt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,o=0;for(let s of t)o===e.length?e.push(i=new r(this.O(M()),this.O(M()),this,this.options)):i=e[o],i._$AI(s),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let i=ct(t).nextSibling;ct(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},A=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,o,s){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=s,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(t,e=this,i,o){let s=this.strings,n=!1;if(s===void 0)t=E(this,t,e,0),n=!U(t)||t!==this._$AH&&t!==S,n&&(this._$AH=t);else{let l=t,a,h;for(t=s[0],a=0;a<s.length-1;a++)h=E(this,l[i+a],e,a),h===S&&(h=this._$AH[a]),n||=!U(h)||h!==this._$AH[a],h===p?t=p:t!==p&&(t+=(h??"")+s[a+1]),this._$AH[a]=h}n&&!o&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},J=class extends A{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},Z=class extends A{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},Q=class extends A{constructor(t,e,i,o,s){super(t,e,i,o,s),this.type=5}_$AI(t,e=this){if((t=E(this,t,e,0)??p)===S)return;let i=this._$AH,o=t===p&&i!==p||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==p&&(i===p||o);o&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},X=class{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){E(this,t)}};var Ot=Y.litHtmlPolyfillSupport;Ot?.(O,H),(Y.litHtmlVersions??=[]).push("3.3.3");var bt=(r,t,e)=>{let i=e?.renderBefore??t,o=i._$litPart$;if(o===void 0){let s=e?.renderBefore??null;i._$litPart$=o=new H(t.insertBefore(M(),s),s,void 0,e??{})}return o._$AI(r),o};var it=globalThis,f=class extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=bt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};f._$litElement$=!0,f.finalized=!0,it.litElementHydrateSupport?.({LitElement:f});var Ht=it.litElementPolyfillSupport;Ht?.({LitElement:f});(it.litElementVersions??=[]).push("4.2.2");var Lt={attribute:!0,type:String,converter:T,reflect:!1,hasChanged:B},Nt=(r=Lt,t,e)=>{let{kind:i,metadata:o}=e,s=globalThis.litPropertyMetadata.get(o);if(s===void 0&&globalThis.litPropertyMetadata.set(o,s=new Map),i==="setter"&&((r=Object.create(r)).wrapped=!0),s.set(e.name,r),i==="accessor"){let{name:n}=e;return{set(l){let a=t.get.call(this);t.set.call(this,l),this.requestUpdate(n,a,r,!0,l)},init(l){return l!==void 0&&this.C(n,void 0,r,l),l}}}if(i==="setter"){let{name:n}=e;return function(l){let a=this[n];t.call(this,l),this.requestUpdate(n,a,r,!0,l)}}throw Error("Unsupported decorator location: "+i)};function m(r){return(t,e)=>typeof e=="object"?Nt(r,t,e):((i,o,s)=>{let n=o.hasOwnProperty(s);return o.constructor.createProperty(s,i),n?Object.getOwnPropertyDescriptor(o,s):void 0})(r,t,e)}var _=class extends f{constructor(){super(...arguments);this._open=!1;this._callState="idle";this._holding=!1;this._holdProgress=0;this._micMuted=!1;this._audioHeld=!1;this.cameraEntity=null;this.hass=null;this.popupSize=null;this.popupPosition=null;this._holdTimer=null;this._holdInterval=null;this._ringTimeout=null;this._cameraCard=null;this._cameraCardEntity=null;this._sipCore=null;this._onSipUpdate=this._handleSipUpdate.bind(this);this._onCallStarted=this._handleCallStarted.bind(this);this._onCallEnded=this._handleCallEnded.bind(this)}connectedCallback(){super.connectedCallback(),console.debug("[hikvision-dialog] connectedCallback \u2014 registering listeners"),window.addEventListener("sipcore-update",this._onSipUpdate),window.addEventListener("sipcore-call-started",this._onCallStarted),window.addEventListener("sipcore-call-ended",this._onCallEnded)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("sipcore-update",this._onSipUpdate),window.removeEventListener("sipcore-call-started",this._onCallStarted),window.removeEventListener("sipcore-call-ended",this._onCallEnded)}_handleSipUpdate(){this._sipCore=window.sipCore??null,this._sipCore?.hass&&(this.hass=this._sipCore.hass,this._cameraCard&&(this._cameraCard.hass=this._sipCore.hass)),this.requestUpdate()}_handleCallStarted(){console.debug("[hikvision-dialog] sipcore-call-started received, opening popup"),this._sipCore=window.sipCore??null,this.cameraEntity||(this.cameraEntity=this._sipCore?.config?.popup_config?.camera_entity??null),!this.hass&&this._sipCore?.hass&&(this.hass=this._sipCore.hass),this._callState="ringing",this._open=!0,(!this._cameraCard||this._cameraCardEntity!==this.cameraEntity)&&(this._cameraCard=null),this._ensureCameraCard(),this._ringTimeout=setTimeout(()=>{this._callState==="ringing"&&this._handleCallEnded()},35e3)}_handleCallEnded(){this._ringTimeout&&clearTimeout(this._ringTimeout),this._callState="ended",setTimeout(()=>{this._callState="idle",this._open=!1},2e3)}openManual(){this._sipCore=window.sipCore??null,this._open=!0,this._ensureCameraCard()}async _ensureCameraCard(){if(this._cameraCard||!window.loadCardHelpers)return;let e=window.sipCore,i=this.cameraEntity??e?.config?.popup_config?.camera_entity;if(!i)return;let o=this.hass??e?.hass;if(!o){setTimeout(()=>this._ensureCameraCard(),500);return}let s=await window.loadCardHelpers();this._cameraCard=await s.createCardElement({type:"custom:advanced-camera-card",cameras:[{camera_entity:i}],live:{show_image_during_load:!0},menu:{mode:"none"},dimensions:{aspect_ratio:"16:9"}}),this._cameraCardEntity=i,this._cameraCard.hass=o,this.requestUpdate()}async _answer(){if(this._sipCore)try{let e=window.AudioContext??window.webkitAudioContext;if(e){let i=new e;i.state==="suspended"&&await i.resume()}await this._sipCore.answerCall(),this._callState="active"}catch(e){console.error("[doorbell] answer failed:",e)}}_hangup(){this._ringTimeout&&clearTimeout(this._ringTimeout),this._sipCore&&this._sipCore.endCall(),this._callState="idle",this._open=!1}_close(){this._callState==="ringing"||this._callState==="active"?this._hangup():this._open=!1}_toggleMic(){if(!this._sipCore)return;let e=this._sipCore.RTCSession;if(e?.connection){let o=e.connection.getSenders().find(s=>s.track?.kind==="audio");if(o?.track)o.track.enabled=this._micMuted,this._micMuted=!o.track.enabled;else{let s=this._sipCore.outgoingAudio;s&&(s.muted=!s.muted,this._micMuted=s.muted)}}this.requestUpdate()}_toggleAudio(){if(!this._sipCore)return;let e=this._sipCore.remoteAudioStream;if(e){let i=this._audioHeld;e.getAudioTracks().forEach(o=>{o.enabled=i}),this._audioHeld=!i}this.requestUpdate()}_gateStart(e){e.preventDefault(),this._holding=!0,this._holdProgress=0;let i=(this._sipCore?.config?.popup_config?.gate_hold_time??2)*1e3,o=50,s=i/o;this._holdInterval=setInterval(()=>{this._holdProgress=Math.min(100,this._holdProgress+100/s),this.requestUpdate()},o),this._holdTimer=setTimeout(()=>{this._openGate(),this._gateEnd()},i)}_gateEnd(){this._holdTimer&&clearTimeout(this._holdTimer),this._holdInterval&&clearInterval(this._holdInterval),this._holding=!1,this._holdProgress=0}_openGate(){let e=this._sipCore?.config?.popup_config?.gate_entity;if(!e)return;let i=e.split(".")[0],o=i==="button"?"press":i==="lock"?"unlock":"turn_on";this._sipCore.hass.callService(i,o,{entity_id:e}),navigator.vibrate&&navigator.vibrate([100,50,100]),this._sipCore?.config?.popup_config?.close_on_gate&&this._callState==="active"&&setTimeout(()=>this._hangup(),500)}_renderBottomBar(){let e=this._callState==="ringing",i=this._callState==="active",o=this._callState==="ended",s=d`
            <div class="gate-wrap">
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
        `;if(o)return d`<div class="bottom-bar ended"><ha-icon icon="mdi:phone-hangup"></ha-icon> Chiamata terminata</div>`;if(e)return d`
                <div class="bottom-bar">
                    <ha-icon-button class="btn deny-btn" @click=${this._hangup}>
                        <ha-icon icon="mdi:phone-hangup"></ha-icon>
                    </ha-icon-button>
                    ${s}
                    <ha-icon-button class="btn accept-btn" @click=${this._answer}>
                        <ha-icon icon="mdi:phone"></ha-icon>
                    </ha-icon-button>
                </div>
            `;let n=d`
            <ha-icon-button class="btn ctrl-btn ${this._micMuted?"muted":""}" @click=${this._toggleMic}>
                <ha-icon icon="${this._micMuted?"mdi:microphone-off":"mdi:microphone"}"></ha-icon>
            </ha-icon-button>
        `,l=d`
            <ha-icon-button class="btn ctrl-btn ${this._audioHeld?"muted":""}" @click=${this._toggleAudio}>
                <ha-icon icon="${this._audioHeld?"mdi:volume-off":"mdi:volume-high"}"></ha-icon>
            </ha-icon-button>
        `;return i?d`
                <div class="bottom-bar">
                    <ha-icon-button class="btn deny-btn" @click=${this._hangup}>
                        <ha-icon icon="mdi:phone-hangup"></ha-icon>
                    </ha-icon-button>
                    ${s}
                    ${n}
                    ${l}
                </div>
            `:d`
            <div class="bottom-bar">
                ${s}
                ${n}
                ${l}
            </div>
        `}get _popupSize(){return this.popupSize??"medium"}get _popupPosition(){return this.popupPosition??"center"}get _effectivePopupSize(){return this._popupPosition==="center"?this._popupSize:this._popupSize==="large"?"medium":this._popupSize}updated(){this._injectDialogSizeStyle()}_popupWidth(){switch(this._effectivePopupSize){case"small":return"min(92vw, clamp(360px, 42vw, 560px))";case"large":return"min(96vw, clamp(720px, 82vw, 1400px))";case"medium":default:return"min(92vw, clamp(560px, 70vw, 1100px))"}}_injectDialogSizeStyle(e=0){let i=this.shadowRoot?.querySelector("ha-dialog");if(!i)return;let o=this._popupWidth();if(i.style.setProperty("--mdc-dialog-min-width",o),i.style.setProperty("--mdc-dialog-max-width",o),i.style.setProperty("--dialog-surface-width",o),i.style.setProperty("--dialog-content-padding","0"),i.style.setProperty("width",o),i.style.setProperty("max-width",o),!i.shadowRoot){e<10&&window.setTimeout(()=>this._injectDialogSizeStyle(e+1),50);return}let s="hikvision-size-override",n=i.shadowRoot.getElementById(s);n||(n=document.createElement("style"),n.id=s,i.shadowRoot.appendChild(n)),n.textContent=`
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
        `;let l=i.shadowRoot.querySelector("wa-dialog");if(!l?.shadowRoot){e<10&&window.setTimeout(()=>this._injectDialogSizeStyle(e+1),50);return}l.style.setProperty("--width",o),l.style.setProperty("width",o),l.style.setProperty("max-width",o);let a=l.shadowRoot.getElementById(s);a||(a=document.createElement("style"),a.id=s,l.shadowRoot.appendChild(a)),a.textContent=`
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
        `}render(){let e=this._popupPosition,i=e!=="center",o=this._effectivePopupSize;return i?d`
                <div class="anchored-overlay ${e} size-${o} ${this._open?"open":""}">
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
        `}static get styles(){return k`
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
        `}};g([m({type:Boolean})],_.prototype,"_open",2),g([m({type:String})],_.prototype,"_callState",2),g([m({type:Boolean})],_.prototype,"_holding",2),g([m({type:Number})],_.prototype,"_holdProgress",2),g([m({type:Boolean})],_.prototype,"_micMuted",2),g([m({type:Boolean})],_.prototype,"_audioHeld",2),g([m({type:String})],_.prototype,"cameraEntity",2),g([m({type:Object})],_.prototype,"hass",2),g([m({type:String})],_.prototype,"popupSize",2),g([m({type:String})],_.prototype,"popupPosition",2);customElements.define("hikvision-doorbell-dialog",_);var ot=class extends f{constructor(){super(...arguments);this._config={};this._hass=null;this._onSipCoreUpdate=()=>this._applyPopupConfig()}static get styles(){return k`
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
        `}static getStubConfig(){return{hide_button:!1,button_label:"Doorbell",call_state_entity:""}}static getConfigElement(){return document.createElement("hikvision-doorbell-button-editor")}connectedCallback(){super.connectedCallback(),document.querySelector("hikvision-doorbell-dialog")||document.body.appendChild(document.createElement("hikvision-doorbell-dialog")),window.addEventListener("sipcore-update",this._onSipCoreUpdate),this._applyPopupConfig()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("sipcore-update",this._onSipCoreUpdate)}setConfig(e){this._config=e,this._applyPopupConfig()}_applyPopupConfig(){let e=document.querySelector("hikvision-doorbell-dialog");e&&(e.popupSize=this._config.popup_size??null,e.popupPosition=this._config.popup_position??null,this._config.camera_entity&&(e.cameraEntity=this._config.camera_entity))}set hass(e){this._hass=e,this.requestUpdate()}get _isRinging(){return!this._hass||!this._config?.call_state_entity?!1:this._hass.states[this._config.call_state_entity]?.state==="ringing"}_renderChips(){let e=this._config?.extra_entities??[];return!e.length||!this._hass?d``:d`
            <div class="chips" @click=${i=>i.stopPropagation()}>
                ${e.map(({entity:i,icon:o,label:s})=>{let n=this._hass.states[i];if(!n)return d``;let l=o||n.attributes.icon||"mdi:dots-horizontal",a=this._hass.formatEntityState?this._hass.formatEntityState(n):n.state,h=s?`${s}: ${a}`:a;return d`
                        <div class="chip">
                            <ha-icon icon=${l}></ha-icon>
                            <span>${h}</span>
                        </div>
                    `})}
            </div>
        `}render(){if(this._config?.hide_button)return d``;let e=this._config?.button_label??"Doorbell",i=this._isRinging;return d`
            <ha-card @click=${this._open}>
                <div class="main-row">
                    <ha-icon
                        class=${i?"ringing":""}
                        icon=${i?"mdi:doorbell":"mdi:doorbell-video"}
                    ></ha-icon>
                    <span class="label">${e}</span>
                </div>
                ${this._renderChips()}
            </ha-card>
        `}_open(){let e=document.querySelector("hikvision-doorbell-dialog");e||(e=document.createElement("hikvision-doorbell-dialog"),document.body.appendChild(e)),this._config?.camera_entity&&(e.cameraEntity=this._config.camera_entity),this._hass&&(e.hass=this._hass),e.openManual()}};customElements.define("hikvision-doorbell-button",ot);var L=class extends f{constructor(){super(...arguments);this.config={}}static get styles(){return k`
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
        `}setConfig(e){this.config=e}_emit(e){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_selectorChanged(e,i){let o={...this.config,[e]:i.detail.value};e==="popup_position"&&i.detail.value!=="center"&&o.popup_size==="large"&&(o.popup_size="medium"),this._emit(o)}_extraEntityChanged(e,i,o){let s=[...this.config.extra_entities??[]];s[e]={...s[e],[i]:o.detail.value},this._emit({...this.config,extra_entities:s})}_addExtraEntity(){let e=[...this.config.extra_entities??[],{entity:"",icon:""}];this._emit({...this.config,extra_entities:e})}_removeExtraEntity(e){let i=(this.config.extra_entities??[]).filter((o,s)=>s!==e);this._emit({...this.config,extra_entities:i})}render(){let e=this.config.extra_entities??[],i=this.config.popup_position??"center",o=i==="center"?[{value:"small",label:"Small"},{value:"medium",label:"Medium"},{value:"large",label:"Large"}]:[{value:"small",label:"Small"},{value:"medium",label:"Medium"}],s=i==="center"?this.config.popup_size??"medium":this.config.popup_size==="large"?"medium":this.config.popup_size??"medium";return d`
            <div class="form">
                <div class="row">
                    <div class="section-label">Button label</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{text:{}}}
                        .value=${this.config.button_label??"Doorbell"}
                        @value-changed=${n=>this._selectorChanged("button_label",n)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Call state entity (ringing animation)</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{entity:{domain:"sensor"}}}
                        .value=${this.config.call_state_entity??""}
                        @value-changed=${n=>this._selectorChanged("call_state_entity",n)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Camera entity (optional)</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{entity:{domain:"camera"}}}
                        .value=${this.config.camera_entity??""}
                        @value-changed=${n=>this._selectorChanged("camera_entity",n)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Popup position</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{select:{options:[{value:"center",label:"Center"},{value:"bottom-left",label:"Bottom left"},{value:"bottom-right",label:"Bottom right"}],mode:"dropdown"}}}
                        .value=${i}
                        @value-changed=${n=>this._selectorChanged("popup_position",n)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Popup size</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{select:{options:o,mode:"dropdown"}}}
                        .value=${s}
                        @value-changed=${n=>this._selectorChanged("popup_size",n)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{boolean:{}}}
                        .value=${this.config.hide_button??!1}
                        .label=${"Hide button (popup only on incoming call)"}
                        @value-changed=${n=>this._selectorChanged("hide_button",n)}
                    ></ha-selector>
                </div>

                <div class="row">
                    <div class="section-title">Extra entities (shown as chips)</div>
                    ${e.map((n,l)=>d`
                        <div class="extra-entity-row">
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{entity:{}}}
                                .value=${n.entity}
                                @value-changed=${a=>this._extraEntityChanged(l,"entity",a)}
                            ></ha-selector>
                            <ha-icon-button class="delete-btn" @click=${()=>this._removeExtraEntity(l)}>
                                <ha-icon icon="mdi:delete"></ha-icon>
                            </ha-icon-button>
                            <div class="sub-row">
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{icon:{}}}
                                    .value=${n.icon??""}
                                    @value-changed=${a=>this._extraEntityChanged(l,"icon",a)}
                                ></ha-selector>
                                <ha-selector
                                    .hass=${this.hass}
                                    .selector=${{text:{}}}
                                    .value=${n.label??""}
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
        `}};g([m({attribute:!1})],L.prototype,"config",2),g([m({attribute:!1})],L.prototype,"hass",2);customElements.define("hikvision-doorbell-button-editor",L);function $t(){document.querySelector("hikvision-doorbell-dialog")?console.debug("[hikvision-dialog] dialog already in DOM, skipping"):(console.debug("[hikvision-dialog] creating dialog element in DOM"),document.body.appendChild(document.createElement("hikvision-doorbell-dialog")))}document.body?$t():window.addEventListener("load",$t,{once:!0});console.info("%c HIKVISION-DOORBELL-CARD %c v0.3.3 ","color: white; background: #025a9e; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;","color: #025a9e; background: #e8f4fd; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;");
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
