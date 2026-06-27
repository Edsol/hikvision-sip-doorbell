var Ct=Object.defineProperty;var At=Object.getOwnPropertyDescriptor;var g=(s,t,e,i)=>{for(var o=i>1?void 0:i?At(t,e):t,n=s.length-1,r;n>=0;n--)(r=s[n])&&(o=(i?r(t,e,o):r(o))||o);return i&&o&&Ct(t,e,o),o};var L=globalThis,z=L.ShadowRoot&&(L.ShadyCSS===void 0||L.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,W=Symbol(),st=new WeakMap,k=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==W)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(z&&t===void 0){let i=e!==void 0&&e.length===1;i&&(t=st.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&st.set(e,t))}return t}toString(){return this.cssText}},nt=s=>new k(typeof s=="string"?s:s+"",void 0,W),I=(s,...t)=>{let e=s.length===1?s[0]:t.reduce((i,o,n)=>i+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+s[n+1],s[0]);return new k(e,s,W)},rt=(s,t)=>{if(z)s.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let i=document.createElement("style"),o=L.litNonce;o!==void 0&&i.setAttribute("nonce",o),i.textContent=e.cssText,s.appendChild(i)}},K=z?s=>s:s=>s instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return nt(e)})(s):s;var{is:St,defineProperty:xt,getOwnPropertyDescriptor:Et,getOwnPropertyNames:wt,getOwnPropertySymbols:kt,getPrototypeOf:Pt}=Object,j=globalThis,at=j.trustedTypes,Tt=at?at.emptyScript:"",Mt=j.reactiveElementPolyfillSupport,P=(s,t)=>s,T={toAttribute(s,t){switch(t){case Boolean:s=s?Tt:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,t){let e=s;switch(t){case Boolean:e=s!==null;break;case Number:e=s===null?null:Number(s);break;case Object:case Array:try{e=JSON.parse(s)}catch{e=null}}return e}},q=(s,t)=>!St(s,t),ct={attribute:!0,type:String,converter:T,reflect:!1,useDefault:!1,hasChanged:q};Symbol.metadata??=Symbol("metadata"),j.litPropertyMetadata??=new WeakMap;var y=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=ct){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),o=this.getPropertyDescriptor(t,i,e);o!==void 0&&xt(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){let{get:o,set:n}=Et(this.prototype,t)??{get(){return this[e]},set(r){this[e]=r}};return{get:o,set(r){let c=o?.call(this);n?.call(this,r),this.requestUpdate(t,c,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ct}static _$Ei(){if(this.hasOwnProperty(P("elementProperties")))return;let t=Pt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(P("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(P("properties"))){let e=this.properties,i=[...wt(e),...kt(e)];for(let o of i)this.createProperty(o,e[o])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[i,o]of e)this.elementProperties.set(i,o)}this._$Eh=new Map;for(let[e,i]of this.elementProperties){let o=this._$Eu(e,i);o!==void 0&&this._$Eh.set(o,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let i=new Set(t.flat(1/0).reverse());for(let o of i)e.unshift(K(o))}else t!==void 0&&e.push(K(t));return e}static _$Eu(t,e){let i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return rt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(o!==void 0&&i.reflect===!0){let n=(i.converter?.toAttribute!==void 0?i.converter:T).toAttribute(e,i.type);this._$Em=t,n==null?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(t,e){let i=this.constructor,o=i._$Eh.get(t);if(o!==void 0&&this._$Em!==o){let n=i.getPropertyOptions(o),r=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:T;this._$Em=o;let c=r.fromAttribute(e,n.type);this[o]=c??this._$Ej?.get(o)??c,this._$Em=null}}requestUpdate(t,e,i,o=!1,n){if(t!==void 0){let r=this.constructor;if(o===!1&&(n=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??q)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:o,wrapped:n},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),n!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),o===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[o,n]of this._$Ep)this[o]=n;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[o,n]of i){let{wrapped:r}=n,c=this[o];r!==!0||this._$AL.has(o)||c===void 0||this.C(o,void 0,n,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};y.elementStyles=[],y.shadowRootOptions={mode:"open"},y[P("elementProperties")]=new Map,y[P("finalized")]=new Map,Mt?.({ReactiveElement:y}),(j.reactiveElementVersions??=[]).push("2.1.2");var Y=globalThis,lt=s=>s,B=Y.trustedTypes,dt=B?B.createPolicy("lit-html",{createHTML:s=>s}):void 0,gt="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,ft="?"+b,Rt=`<${ft}>`,S=document,R=()=>S.createComment(""),U=s=>s===null||typeof s!="object"&&typeof s!="function",tt=Array.isArray,Ut=s=>tt(s)||typeof s?.[Symbol.iterator]=="function",F=`[ 	
\f\r]`,M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ht=/-->/g,pt=/>/g,C=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ut=/'/g,mt=/"/g,vt=/^(?:script|style|textarea|title)$/i,et=s=>(t,...e)=>({_$litType$:s,strings:t,values:e}),d=et(1),Dt=et(2),Wt=et(3),x=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),_t=new WeakMap,A=S.createTreeWalker(S,129);function yt(s,t){if(!tt(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return dt!==void 0?dt.createHTML(t):t}var Ot=(s,t)=>{let e=s.length-1,i=[],o,n=t===2?"<svg>":t===3?"<math>":"",r=M;for(let c=0;c<e;c++){let a=s[c],h,u,l=-1,v=0;for(;v<a.length&&(r.lastIndex=v,u=r.exec(a),u!==null);)v=r.lastIndex,r===M?u[1]==="!--"?r=ht:u[1]!==void 0?r=pt:u[2]!==void 0?(vt.test(u[2])&&(o=RegExp("</"+u[2],"g")),r=C):u[3]!==void 0&&(r=C):r===C?u[0]===">"?(r=o??M,l=-1):u[1]===void 0?l=-2:(l=r.lastIndex-u[2].length,h=u[1],r=u[3]===void 0?C:u[3]==='"'?mt:ut):r===mt||r===ut?r=C:r===ht||r===pt?r=M:(r=C,o=void 0);let $=r===C&&s[c+1].startsWith("/>")?" ":"";n+=r===M?a+Rt:l>=0?(i.push(h),a.slice(0,l)+gt+a.slice(l)+b+$):a+b+(l===-2?c:$)}return[yt(s,n+(s[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]},O=class s{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let n=0,r=0,c=t.length-1,a=this.parts,[h,u]=Ot(t,e);if(this.el=s.createElement(h,i),A.currentNode=this.el.content,e===2||e===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(o=A.nextNode())!==null&&a.length<c;){if(o.nodeType===1){if(o.hasAttributes())for(let l of o.getAttributeNames())if(l.endsWith(gt)){let v=u[r++],$=o.getAttribute(l).split(b),N=/([.?@])?(.*)/.exec(v);a.push({type:1,index:n,name:N[2],strings:$,ctor:N[1]==="."?J:N[1]==="?"?Z:N[1]==="@"?Q:w}),o.removeAttribute(l)}else l.startsWith(b)&&(a.push({type:6,index:n}),o.removeAttribute(l));if(vt.test(o.tagName)){let l=o.textContent.split(b),v=l.length-1;if(v>0){o.textContent=B?B.emptyScript:"";for(let $=0;$<v;$++)o.append(l[$],R()),A.nextNode(),a.push({type:2,index:++n});o.append(l[v],R())}}}else if(o.nodeType===8)if(o.data===ft)a.push({type:2,index:n});else{let l=-1;for(;(l=o.data.indexOf(b,l+1))!==-1;)a.push({type:7,index:n}),l+=b.length-1}n++}}static createElement(t,e){let i=S.createElement("template");return i.innerHTML=t,i}};function E(s,t,e=s,i){if(t===x)return t;let o=i!==void 0?e._$Co?.[i]:e._$Cl,n=U(t)?void 0:t._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),n===void 0?o=void 0:(o=new n(s),o._$AT(s,e,i)),i!==void 0?(e._$Co??=[])[i]=o:e._$Cl=o),o!==void 0&&(t=E(s,o._$AS(s,t.values),o,i)),t}var G=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,o=(t?.creationScope??S).importNode(e,!0);A.currentNode=o;let n=A.nextNode(),r=0,c=0,a=i[0];for(;a!==void 0;){if(r===a.index){let h;a.type===2?h=new H(n,n.nextSibling,this,t):a.type===1?h=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(h=new X(n,this,t)),this._$AV.push(h),a=i[++c]}r!==a?.index&&(n=A.nextNode(),r++)}return A.currentNode=S,o}p(t){let e=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}},H=class s{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,o){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=E(this,t,e),U(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==x&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ut(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(S.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,o=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=O.createElement(yt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(e);else{let n=new G(o,this),r=n.u(this.options);n.p(e),this.T(r),this._$AH=n}}_$AC(t){let e=_t.get(t.strings);return e===void 0&&_t.set(t.strings,e=new O(t)),e}k(t){tt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,o=0;for(let n of t)o===e.length?e.push(i=new s(this.O(R()),this.O(R()),this,this.options)):i=e[o],i._$AI(n),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let i=lt(t).nextSibling;lt(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},w=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,o,n){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(t,e=this,i,o){let n=this.strings,r=!1;if(n===void 0)t=E(this,t,e,0),r=!U(t)||t!==this._$AH&&t!==x,r&&(this._$AH=t);else{let c=t,a,h;for(t=n[0],a=0;a<n.length-1;a++)h=E(this,c[i+a],e,a),h===x&&(h=this._$AH[a]),r||=!U(h)||h!==this._$AH[a],h===p?t=p:t!==p&&(t+=(h??"")+n[a+1]),this._$AH[a]=h}r&&!o&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},J=class extends w{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},Z=class extends w{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},Q=class extends w{constructor(t,e,i,o,n){super(t,e,i,o,n),this.type=5}_$AI(t,e=this){if((t=E(this,t,e,0)??p)===x)return;let i=this._$AH,o=t===p&&i!==p||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==p&&(i===p||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},X=class{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){E(this,t)}};var Ht=Y.litHtmlPolyfillSupport;Ht?.(O,H),(Y.litHtmlVersions??=[]).push("3.3.3");var $t=(s,t,e)=>{let i=e?.renderBefore??t,o=i._$litPart$;if(o===void 0){let n=e?.renderBefore??null;i._$litPart$=o=new H(t.insertBefore(R(),n),n,void 0,e??{})}return o._$AI(s),o};var it=globalThis,f=class extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=$t(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return x}};f._$litElement$=!0,f.finalized=!0,it.litElementHydrateSupport?.({LitElement:f});var Nt=it.litElementPolyfillSupport;Nt?.({LitElement:f});(it.litElementVersions??=[]).push("4.2.2");var Lt={attribute:!0,type:String,converter:T,reflect:!1,hasChanged:q},zt=(s=Lt,t,e)=>{let{kind:i,metadata:o}=e,n=globalThis.litPropertyMetadata.get(o);if(n===void 0&&globalThis.litPropertyMetadata.set(o,n=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),n.set(e.name,s),i==="accessor"){let{name:r}=e;return{set(c){let a=t.get.call(this);t.set.call(this,c),this.requestUpdate(r,a,s,!0,c)},init(c){return c!==void 0&&this.C(r,void 0,s,c),c}}}if(i==="setter"){let{name:r}=e;return function(c){let a=this[r];t.call(this,c),this.requestUpdate(r,a,s,!0,c)}}throw Error("Unsupported decorator location: "+i)};function m(s){return(t,e)=>typeof e=="object"?zt(s,t,e):((i,o,n)=>{let r=o.hasOwnProperty(n);return o.constructor.createProperty(n,i),r?Object.getOwnPropertyDescriptor(o,n):void 0})(s,t,e)}var _=class extends f{constructor(){super(...arguments);this._open=!1;this._callState="idle";this._holding=!1;this._holdProgress=0;this._micMuted=!1;this._audioHeld=!1;this.cameraEntity=null;this.hass=null;this._holdTimer=null;this._holdInterval=null;this._ringTimeout=null;this._cameraCard=null;this._cameraCardEntity=null;this._sipCore=null;this._onSipUpdate=this._handleSipUpdate.bind(this);this._onCallStarted=this._handleCallStarted.bind(this);this._onCallEnded=this._handleCallEnded.bind(this)}connectedCallback(){super.connectedCallback(),console.debug("[hikvision-dialog] connectedCallback \u2014 registering listeners"),window.addEventListener("sipcore-update",this._onSipUpdate),window.addEventListener("sipcore-call-started",this._onCallStarted),window.addEventListener("sipcore-call-ended",this._onCallEnded)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("sipcore-update",this._onSipUpdate),window.removeEventListener("sipcore-call-started",this._onCallStarted),window.removeEventListener("sipcore-call-ended",this._onCallEnded)}_handleSipUpdate(){this._sipCore=window.sipCore??null,this._sipCore?.hass&&(this.hass=this._sipCore.hass,this._cameraCard&&(this._cameraCard.hass=this._sipCore.hass)),this.requestUpdate()}_handleCallStarted(){console.debug("[hikvision-dialog] sipcore-call-started received, opening popup"),this._sipCore=window.sipCore??null,this.cameraEntity||(this.cameraEntity=this._sipCore?.config?.popup_config?.camera_entity??null),!this.hass&&this._sipCore?.hass&&(this.hass=this._sipCore.hass),this._callState="ringing",this._open=!0,(!this._cameraCard||this._cameraCardEntity!==this.cameraEntity)&&(this._cameraCard=null),this._ensureCameraCard(),this._ringTimeout=setTimeout(()=>{this._callState==="ringing"&&this._handleCallEnded()},35e3)}_handleCallEnded(){this._ringTimeout&&clearTimeout(this._ringTimeout),this._callState="ended",setTimeout(()=>{this._callState="idle",this._open=!1},2e3)}openManual(){this._sipCore=window.sipCore??null,this._open=!0,this._ensureCameraCard()}async _ensureCameraCard(){if(this._cameraCard||!window.loadCardHelpers)return;let e=window.sipCore,i=this.cameraEntity??e?.config?.popup_config?.camera_entity;if(!i)return;let o=this.hass??e?.hass;if(!o){setTimeout(()=>this._ensureCameraCard(),500);return}let n=await window.loadCardHelpers();this._cameraCard=await n.createCardElement({type:"custom:advanced-camera-card",cameras:[{camera_entity:i}],live:{show_image_during_load:!0},menu:{mode:"none"},dimensions:{aspect_ratio:"16:9"}}),this._cameraCardEntity=i,this._cameraCard.hass=o,this.requestUpdate()}async _answer(){if(this._sipCore)try{let e=window.AudioContext??window.webkitAudioContext;if(e){let i=new e;i.state==="suspended"&&await i.resume()}await this._sipCore.answerCall(),this._callState="active"}catch(e){console.error("[doorbell] answer failed:",e)}}_hangup(){this._ringTimeout&&clearTimeout(this._ringTimeout),this._sipCore&&this._sipCore.endCall(),this._callState="idle",this._open=!1}_close(){this._callState==="ringing"||this._callState==="active"?this._hangup():this._open=!1}_toggleMic(){if(!this._sipCore)return;let e=this._sipCore.RTCSession;if(e?.connection){let o=e.connection.getSenders().find(n=>n.track?.kind==="audio");if(o?.track)o.track.enabled=this._micMuted,this._micMuted=!o.track.enabled;else{let n=this._sipCore.outgoingAudio;n&&(n.muted=!n.muted,this._micMuted=n.muted)}}this.requestUpdate()}_toggleAudio(){if(!this._sipCore)return;let e=this._sipCore.remoteAudioStream;if(e){let i=this._audioHeld;e.getAudioTracks().forEach(o=>{o.enabled=i}),this._audioHeld=!i}this.requestUpdate()}_gateStart(e){e.preventDefault(),this._holding=!0,this._holdProgress=0;let i=(this._sipCore?.config?.popup_config?.gate_hold_time??2)*1e3,o=50,n=i/o;this._holdInterval=setInterval(()=>{this._holdProgress=Math.min(100,this._holdProgress+100/n),this.requestUpdate()},o),this._holdTimer=setTimeout(()=>{this._openGate(),this._gateEnd()},i)}_gateEnd(){this._holdTimer&&clearTimeout(this._holdTimer),this._holdInterval&&clearInterval(this._holdInterval),this._holding=!1,this._holdProgress=0}_openGate(){let e=this._sipCore?.config?.popup_config?.gate_entity;if(!e)return;let i=e.split(".")[0],o=i==="button"?"press":i==="lock"?"unlock":"turn_on";this._sipCore.hass.callService(i,o,{entity_id:e}),navigator.vibrate&&navigator.vibrate([100,50,100]),this._sipCore?.config?.popup_config?.close_on_gate&&this._callState==="active"&&setTimeout(()=>this._hangup(),500)}_renderBottomBar(){let e=this._callState==="ringing",i=this._callState==="active",o=this._callState==="ended",n=d`
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
        `;if(o)return d`<div class="bottom-bar ended">Chiamata terminata</div>`;if(e)return d`
                <div class="bottom-bar">
                    <ha-icon-button class="btn deny-btn" @click=${this._hangup}>
                        <ha-icon icon="mdi:phone-hangup"></ha-icon>
                    </ha-icon-button>
                    ${n}
                    <ha-icon-button class="btn accept-btn" @click=${this._answer}>
                        <ha-icon icon="mdi:phone"></ha-icon>
                    </ha-icon-button>
                </div>
            `;let r=d`
            <ha-icon-button class="btn ctrl-btn ${this._micMuted?"muted":""}" @click=${this._toggleMic}>
                <ha-icon icon="${this._micMuted?"mdi:microphone-off":"mdi:microphone"}"></ha-icon>
            </ha-icon-button>
        `,c=d`
            <ha-icon-button class="btn ctrl-btn ${this._audioHeld?"muted":""}" @click=${this._toggleAudio}>
                <ha-icon icon="${this._audioHeld?"mdi:volume-off":"mdi:volume-high"}"></ha-icon>
            </ha-icon-button>
        `;return i?d`
                <div class="bottom-bar">
                    <ha-icon-button class="btn deny-btn" @click=${this._hangup}>
                        <ha-icon icon="mdi:phone-hangup"></ha-icon>
                    </ha-icon-button>
                    ${n}
                    ${r}
                    ${c}
                </div>
            `:d`
            <div class="bottom-bar">
                ${n}
                ${r}
                ${c}
            </div>
        `}get _popupSize(){return this._sipCore?.config?.popup_config?.popup_size??"large"}get _popupPosition(){return this._sipCore?.config?.popup_config?.popup_position??"center"}render(){let e=this._popupPosition;return e!=="center"?d`
                <div class="anchored-overlay ${e} size-${this._popupSize} ${this._open?"open":""}">
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
                class="size-${this._popupSize}">
                <ha-dialog-header slot="heading">
                    <ha-icon-button slot="navigationIcon" @click=${this._close}>
                        <ha-icon icon="mdi:close"></ha-icon>
                    </ha-icon-button>
                    <span slot="title" class="title ${this._callState}">
                        ${this._callState==="ringing"?d`<ha-icon class="ring-icon" icon="mdi:phone-ring"></ha-icon> Chiamata in arrivo`:this._callState==="active"?d`<ha-icon icon="mdi:phone-in-talk"></ha-icon> In chiamata`:this._callState==="ended"?d`<ha-icon icon="mdi:phone-hangup"></ha-icon> Chiamata terminata`:d`<ha-icon icon="mdi:doorbell-video"></ha-icon> Videocitofono`}
                    </span>
                </ha-dialog-header>

                <div class="content">
                    <div class="camera-wrap">
                        ${this._cameraCard??d`<div class="camera-placeholder"><ha-icon icon="mdi:camera-off"></ha-icon></div>`}
                    </div>
                    ${this._renderBottomBar()}
                </div>
            </ha-dialog>
        `}static get styles(){return I`
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
        `}};g([m({type:Boolean})],_.prototype,"_open",2),g([m({type:String})],_.prototype,"_callState",2),g([m({type:Boolean})],_.prototype,"_holding",2),g([m({type:Number})],_.prototype,"_holdProgress",2),g([m({type:Boolean})],_.prototype,"_micMuted",2),g([m({type:Boolean})],_.prototype,"_audioHeld",2),g([m({type:String})],_.prototype,"cameraEntity",2),g([m({type:Object})],_.prototype,"hass",2);customElements.define("hikvision-doorbell-dialog",_);var ot=class extends f{constructor(){super(...arguments);this._config={};this._hass=null}static get styles(){return I`
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
        `}static getStubConfig(){return{hide_button:!1,button_label:"Videocitofono"}}static getConfigElement(){return document.createElement("hikvision-doorbell-button-editor")}connectedCallback(){super.connectedCallback(),document.querySelector("hikvision-doorbell-dialog")||document.body.appendChild(document.createElement("hikvision-doorbell-dialog"))}setConfig(e){this._config=e}set hass(e){this._hass=e}render(){if(this._config?.hide_button)return d``;let e=this._config?.button_label??"Videocitofono";return d`
            <ha-card @click=${this._open}>
                <ha-icon icon="mdi:doorbell-video"></ha-icon>
                <span>${e}</span>
            </ha-card>
        `}_open(){let e=document.querySelector("hikvision-doorbell-dialog");e||(e=document.createElement("hikvision-doorbell-dialog"),document.body.appendChild(e)),this._config?.camera_entity&&(e.cameraEntity=this._config.camera_entity),this._hass&&(e.hass=this._hass),e.openManual()}};customElements.define("hikvision-doorbell-button",ot);var D=class extends f{constructor(){super(...arguments);this.config={}}setConfig(e){this.config=e}_valueChanged(e){let o=e.target.dataset.key;this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:{...this.config,[o]:e.detail.value}},bubbles:!0,composed:!0}))}_checkboxChanged(e){let i=e.target,o=i.dataset.key;this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:{...this.config,[o]:i.checked}},bubbles:!0,composed:!0}))}render(){return d`
            <div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
                <ha-textfield
                    label="Button label"
                    .value=${this.config.button_label??"Videocitofono"}
                    data-key="button_label"
                    @value-changed=${this._valueChanged}
                ></ha-textfield>
                <ha-textfield
                    label="Camera entity (optional)"
                    .value=${this.config.camera_entity??""}
                    data-key="camera_entity"
                    @value-changed=${this._valueChanged}
                ></ha-textfield>
                <ha-formfield label="Hide button (popup only on incoming call)">
                    <ha-checkbox
                        .checked=${this.config.hide_button??!1}
                        data-key="hide_button"
                        @change=${this._checkboxChanged}
                    ></ha-checkbox>
                </ha-formfield>
            </div>
        `}};g([m({attribute:!1})],D.prototype,"config",2);customElements.define("hikvision-doorbell-button-editor",D);function bt(){document.querySelector("hikvision-doorbell-dialog")?console.debug("[hikvision-dialog] dialog already in DOM, skipping"):(console.debug("[hikvision-dialog] creating dialog element in DOM"),document.body.appendChild(document.createElement("hikvision-doorbell-dialog")))}document.body?bt():window.addEventListener("load",bt,{once:!0});console.info("%c HIKVISION-DOORBELL-CARD %c v0.1.9 ","color: white; background: #025a9e; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;","color: #025a9e; background: #e8f4fd; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;");
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
