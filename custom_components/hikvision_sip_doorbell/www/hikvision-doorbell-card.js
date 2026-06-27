var Ct=Object.defineProperty;var xt=Object.getOwnPropertyDescriptor;var _=(n,t,e,i)=>{for(var s=i>1?void 0:i?xt(t,e):t,o=n.length-1,r;o>=0;o--)(r=n[o])&&(s=(i?r(t,e,s):r(s))||s);return i&&s&&Ct(t,e,s),s};var I=globalThis,j=I.ShadowRoot&&(I.ShadyCSS===void 0||I.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,W=Symbol(),ot=new WeakMap,P=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==W)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(j&&t===void 0){let i=e!==void 0&&e.length===1;i&&(t=ot.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&ot.set(e,t))}return t}toString(){return this.cssText}},nt=n=>new P(typeof n=="string"?n:n+"",void 0,W),k=(n,...t)=>{let e=n.length===1?n[0]:t.reduce((i,s,o)=>i+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+n[o+1],n[0]);return new P(e,n,W)},rt=(n,t)=>{if(j)n.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let i=document.createElement("style"),s=I.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=e.cssText,n.appendChild(i)}},K=j?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return nt(e)})(n):n;var{is:St,defineProperty:wt,getOwnPropertyDescriptor:At,getOwnPropertyNames:Et,getOwnPropertySymbols:Pt,getPrototypeOf:kt}=Object,q=globalThis,at=q.trustedTypes,Tt=at?at.emptyScript:"",Rt=q.reactiveElementPolyfillSupport,T=(n,t)=>n,R={toAttribute(n,t){switch(t){case Boolean:n=n?Tt:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let e=n;switch(t){case Boolean:e=n!==null;break;case Number:e=n===null?null:Number(n);break;case Object:case Array:try{e=JSON.parse(n)}catch{e=null}}return e}},B=(n,t)=>!St(n,t),ct={attribute:!0,type:String,converter:R,reflect:!1,useDefault:!1,hasChanged:B};Symbol.metadata??=Symbol("metadata"),q.litPropertyMetadata??=new WeakMap;var y=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=ct){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(t,i,e);s!==void 0&&wt(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){let{get:s,set:o}=At(this.prototype,t)??{get(){return this[e]},set(r){this[e]=r}};return{get:s,set(r){let c=s?.call(this);o?.call(this,r),this.requestUpdate(t,c,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ct}static _$Ei(){if(this.hasOwnProperty(T("elementProperties")))return;let t=kt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(T("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(T("properties"))){let e=this.properties,i=[...Et(e),...Pt(e)];for(let s of i)this.createProperty(s,e[s])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[i,s]of e)this.elementProperties.set(i,s)}this._$Eh=new Map;for(let[e,i]of this.elementProperties){let s=this._$Eu(e,i);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let i=new Set(t.flat(1/0).reverse());for(let s of i)e.unshift(K(s))}else t!==void 0&&e.push(K(t));return e}static _$Eu(t,e){let i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return rt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){let o=(i.converter?.toAttribute!==void 0?i.converter:R).toAttribute(e,i.type);this._$Em=t,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){let i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let o=i.getPropertyOptions(s),r=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:R;this._$Em=s;let c=r.fromAttribute(e,o.type);this[s]=c??this._$Ej?.get(s)??c,this._$Em=null}}requestUpdate(t,e,i,s=!1,o){if(t!==void 0){let r=this.constructor;if(s===!1&&(o=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??B)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),o!==!0||r!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,o]of i){let{wrapped:r}=o,c=this[s];r!==!0||this._$AL.has(s)||c===void 0||this.C(s,void 0,o,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};y.elementStyles=[],y.shadowRootOptions={mode:"open"},y[T("elementProperties")]=new Map,y[T("finalized")]=new Map,Rt?.({ReactiveElement:y}),(q.reactiveElementVersions??=[]).push("2.1.2");var Y=globalThis,lt=n=>n,V=Y.trustedTypes,dt=V?V.createPolicy("lit-html",{createHTML:n=>n}):void 0,gt="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,ft="?"+b,Mt=`<${ft}>`,S=document,U=()=>S.createComment(""),z=n=>n===null||typeof n!="object"&&typeof n!="function",tt=Array.isArray,Ut=n=>tt(n)||typeof n?.[Symbol.iterator]=="function",F=`[ 	
\f\r]`,M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ht=/-->/g,pt=/>/g,C=RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ut=/'/g,mt=/"/g,vt=/^(?:script|style|textarea|title)$/i,et=n=>(t,...e)=>({_$litType$:n,strings:t,values:e}),l=et(1),Dt=et(2),Wt=et(3),w=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),_t=new WeakMap,x=S.createTreeWalker(S,129);function yt(n,t){if(!tt(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return dt!==void 0?dt.createHTML(t):t}var zt=(n,t)=>{let e=n.length-1,i=[],s,o=t===2?"<svg>":t===3?"<math>":"",r=M;for(let c=0;c<e;c++){let a=n[c],h,u,d=-1,v=0;for(;v<a.length&&(r.lastIndex=v,u=r.exec(a),u!==null);)v=r.lastIndex,r===M?u[1]==="!--"?r=ht:u[1]!==void 0?r=pt:u[2]!==void 0?(vt.test(u[2])&&(s=RegExp("</"+u[2],"g")),r=C):u[3]!==void 0&&(r=C):r===C?u[0]===">"?(r=s??M,d=-1):u[1]===void 0?d=-2:(d=r.lastIndex-u[2].length,h=u[1],r=u[3]===void 0?C:u[3]==='"'?mt:ut):r===mt||r===ut?r=C:r===ht||r===pt?r=M:(r=C,s=void 0);let $=r===C&&n[c+1].startsWith("/>")?" ":"";o+=r===M?a+Mt:d>=0?(i.push(h),a.slice(0,d)+gt+a.slice(d)+b+$):a+b+(d===-2?c:$)}return[yt(n,o+(n[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]},O=class n{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,r=0,c=t.length-1,a=this.parts,[h,u]=zt(t,e);if(this.el=n.createElement(h,i),x.currentNode=this.el.content,e===2||e===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=x.nextNode())!==null&&a.length<c;){if(s.nodeType===1){if(s.hasAttributes())for(let d of s.getAttributeNames())if(d.endsWith(gt)){let v=u[r++],$=s.getAttribute(d).split(b),N=/([.?@])?(.*)/.exec(v);a.push({type:1,index:o,name:N[2],strings:$,ctor:N[1]==="."?J:N[1]==="?"?Z:N[1]==="@"?Q:E}),s.removeAttribute(d)}else d.startsWith(b)&&(a.push({type:6,index:o}),s.removeAttribute(d));if(vt.test(s.tagName)){let d=s.textContent.split(b),v=d.length-1;if(v>0){s.textContent=V?V.emptyScript:"";for(let $=0;$<v;$++)s.append(d[$],U()),x.nextNode(),a.push({type:2,index:++o});s.append(d[v],U())}}}else if(s.nodeType===8)if(s.data===ft)a.push({type:2,index:o});else{let d=-1;for(;(d=s.data.indexOf(b,d+1))!==-1;)a.push({type:7,index:o}),d+=b.length-1}o++}}static createElement(t,e){let i=S.createElement("template");return i.innerHTML=t,i}};function A(n,t,e=n,i){if(t===w)return t;let s=i!==void 0?e._$Co?.[i]:e._$Cl,o=z(t)?void 0:t._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),o===void 0?s=void 0:(s=new o(n),s._$AT(n,e,i)),i!==void 0?(e._$Co??=[])[i]=s:e._$Cl=s),s!==void 0&&(t=A(n,s._$AS(n,t.values),s,i)),t}var G=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??S).importNode(e,!0);x.currentNode=s;let o=x.nextNode(),r=0,c=0,a=i[0];for(;a!==void 0;){if(r===a.index){let h;a.type===2?h=new H(o,o.nextSibling,this,t):a.type===1?h=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(h=new X(o,this,t)),this._$AV.push(h),a=i[++c]}r!==a?.index&&(o=x.nextNode(),r++)}return x.currentNode=S,s}p(t){let e=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}},H=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=A(this,t,e),z(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==w&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ut(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&z(this._$AH)?this._$AA.nextSibling.data=t:this.T(S.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=O.createElement(yt(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{let o=new G(s,this),r=o.u(this.options);o.p(e),this.T(r),this._$AH=o}}_$AC(t){let e=_t.get(t.strings);return e===void 0&&_t.set(t.strings,e=new O(t)),e}k(t){tt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,s=0;for(let o of t)s===e.length?e.push(i=new n(this.O(U()),this.O(U()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let i=lt(t).nextSibling;lt(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},E=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(t,e=this,i,s){let o=this.strings,r=!1;if(o===void 0)t=A(this,t,e,0),r=!z(t)||t!==this._$AH&&t!==w,r&&(this._$AH=t);else{let c=t,a,h;for(t=o[0],a=0;a<o.length-1;a++)h=A(this,c[i+a],e,a),h===w&&(h=this._$AH[a]),r||=!z(h)||h!==this._$AH[a],h===p?t=p:t!==p&&(t+=(h??"")+o[a+1]),this._$AH[a]=h}r&&!s&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},J=class extends E{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}},Z=class extends E{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}},Q=class extends E{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=A(this,t,e,0)??p)===w)return;let i=this._$AH,s=t===p&&i!==p||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==p&&(i===p||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},X=class{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){A(this,t)}};var Ot=Y.litHtmlPolyfillSupport;Ot?.(O,H),(Y.litHtmlVersions??=[]).push("3.3.3");var $t=(n,t,e)=>{let i=e?.renderBefore??t,s=i._$litPart$;if(s===void 0){let o=e?.renderBefore??null;i._$litPart$=s=new H(t.insertBefore(U(),o),o,void 0,e??{})}return s._$AI(n),s};var it=globalThis,f=class extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=$t(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return w}};f._$litElement$=!0,f.finalized=!0,it.litElementHydrateSupport?.({LitElement:f});var Ht=it.litElementPolyfillSupport;Ht?.({LitElement:f});(it.litElementVersions??=[]).push("4.2.2");var Lt={attribute:!0,type:String,converter:R,reflect:!1,hasChanged:B},Nt=(n=Lt,t,e)=>{let{kind:i,metadata:s}=e,o=globalThis.litPropertyMetadata.get(s);if(o===void 0&&globalThis.litPropertyMetadata.set(s,o=new Map),i==="setter"&&((n=Object.create(n)).wrapped=!0),o.set(e.name,n),i==="accessor"){let{name:r}=e;return{set(c){let a=t.get.call(this);t.set.call(this,c),this.requestUpdate(r,a,n,!0,c)},init(c){return c!==void 0&&this.C(r,void 0,n,c),c}}}if(i==="setter"){let{name:r}=e;return function(c){let a=this[r];t.call(this,c),this.requestUpdate(r,a,n,!0,c)}}throw Error("Unsupported decorator location: "+i)};function m(n){return(t,e)=>typeof e=="object"?Nt(n,t,e):((i,s,o)=>{let r=s.hasOwnProperty(o);return s.constructor.createProperty(o,i),r?Object.getOwnPropertyDescriptor(s,o):void 0})(n,t,e)}var g=class extends f{constructor(){super(...arguments);this._open=!1;this._callState="idle";this._holding=!1;this._holdProgress=0;this._micMuted=!1;this._audioHeld=!1;this.cameraEntity=null;this.hass=null;this._holdTimer=null;this._holdInterval=null;this._ringTimeout=null;this._cameraCard=null;this._cameraCardEntity=null;this._sipCore=null;this._onSipUpdate=this._handleSipUpdate.bind(this);this._onCallStarted=this._handleCallStarted.bind(this);this._onCallEnded=this._handleCallEnded.bind(this)}connectedCallback(){super.connectedCallback(),console.debug("[hikvision-dialog] connectedCallback \u2014 registering listeners"),window.addEventListener("sipcore-update",this._onSipUpdate),window.addEventListener("sipcore-call-started",this._onCallStarted),window.addEventListener("sipcore-call-ended",this._onCallEnded)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("sipcore-update",this._onSipUpdate),window.removeEventListener("sipcore-call-started",this._onCallStarted),window.removeEventListener("sipcore-call-ended",this._onCallEnded)}_handleSipUpdate(){this._sipCore=window.sipCore??null,this._sipCore?.hass&&(this.hass=this._sipCore.hass,this._cameraCard&&(this._cameraCard.hass=this._sipCore.hass)),this.requestUpdate()}_handleCallStarted(){console.debug("[hikvision-dialog] sipcore-call-started received, opening popup"),this._sipCore=window.sipCore??null,this.cameraEntity||(this.cameraEntity=this._sipCore?.config?.popup_config?.camera_entity??null),!this.hass&&this._sipCore?.hass&&(this.hass=this._sipCore.hass),this._callState="ringing",this._open=!0,(!this._cameraCard||this._cameraCardEntity!==this.cameraEntity)&&(this._cameraCard=null),this._ensureCameraCard(),this._ringTimeout=setTimeout(()=>{this._callState==="ringing"&&this._handleCallEnded()},35e3)}_handleCallEnded(){this._ringTimeout&&clearTimeout(this._ringTimeout),this._callState="ended",setTimeout(()=>{this._callState="idle",this._open=!1},2e3)}openManual(){this._sipCore=window.sipCore??null,this._open=!0,this._ensureCameraCard()}async _ensureCameraCard(){if(this._cameraCard||!window.loadCardHelpers)return;let e=window.sipCore,i=this.cameraEntity??e?.config?.popup_config?.camera_entity;if(!i)return;let s=this.hass??e?.hass;if(!s){setTimeout(()=>this._ensureCameraCard(),500);return}let o=await window.loadCardHelpers();this._cameraCard=await o.createCardElement({type:"custom:advanced-camera-card",cameras:[{camera_entity:i}],live:{show_image_during_load:!0},menu:{mode:"none"},dimensions:{aspect_ratio:"16:9"}}),this._cameraCardEntity=i,this._cameraCard.hass=s,this.requestUpdate()}async _answer(){if(this._sipCore)try{let e=window.AudioContext??window.webkitAudioContext;if(e){let i=new e;i.state==="suspended"&&await i.resume()}await this._sipCore.answerCall(),this._callState="active"}catch(e){console.error("[doorbell] answer failed:",e)}}_hangup(){this._ringTimeout&&clearTimeout(this._ringTimeout),this._sipCore&&this._sipCore.endCall(),this._callState="idle",this._open=!1}_close(){this._callState==="ringing"||this._callState==="active"?this._hangup():this._open=!1}_toggleMic(){if(!this._sipCore)return;let e=this._sipCore.RTCSession;if(e?.connection){let s=e.connection.getSenders().find(o=>o.track?.kind==="audio");if(s?.track)s.track.enabled=this._micMuted,this._micMuted=!s.track.enabled;else{let o=this._sipCore.outgoingAudio;o&&(o.muted=!o.muted,this._micMuted=o.muted)}}this.requestUpdate()}_toggleAudio(){if(!this._sipCore)return;let e=this._sipCore.remoteAudioStream;if(e){let i=this._audioHeld;e.getAudioTracks().forEach(s=>{s.enabled=i}),this._audioHeld=!i}this.requestUpdate()}_gateStart(e){e.preventDefault(),this._holding=!0,this._holdProgress=0;let i=(this._sipCore?.config?.popup_config?.gate_hold_time??2)*1e3,s=50,o=i/s;this._holdInterval=setInterval(()=>{this._holdProgress=Math.min(100,this._holdProgress+100/o),this.requestUpdate()},s),this._holdTimer=setTimeout(()=>{this._openGate(),this._gateEnd()},i)}_gateEnd(){this._holdTimer&&clearTimeout(this._holdTimer),this._holdInterval&&clearInterval(this._holdInterval),this._holding=!1,this._holdProgress=0}_openGate(){let e=this._sipCore?.config?.popup_config?.gate_entity;if(!e)return;let i=e.split(".")[0],s=i==="button"?"press":i==="lock"?"unlock":"turn_on";this._sipCore.hass.callService(i,s,{entity_id:e}),navigator.vibrate&&navigator.vibrate([100,50,100]),this._sipCore?.config?.popup_config?.close_on_gate&&this._callState==="active"&&setTimeout(()=>this._hangup(),500)}_renderBottomBar(){let e=this._callState==="ringing",i=this._callState==="active",s=this._callState==="ended",o=l`
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
        `;if(s)return l`<div class="bottom-bar ended">Chiamata terminata</div>`;if(e)return l`
                <div class="bottom-bar">
                    <ha-icon-button class="btn deny-btn" @click=${this._hangup}>
                        <ha-icon icon="mdi:phone-hangup"></ha-icon>
                    </ha-icon-button>
                    ${o}
                    <ha-icon-button class="btn accept-btn" @click=${this._answer}>
                        <ha-icon icon="mdi:phone"></ha-icon>
                    </ha-icon-button>
                </div>
            `;let r=l`
            <ha-icon-button class="btn ctrl-btn ${this._micMuted?"muted":""}" @click=${this._toggleMic}>
                <ha-icon icon="${this._micMuted?"mdi:microphone-off":"mdi:microphone"}"></ha-icon>
            </ha-icon-button>
        `,c=l`
            <ha-icon-button class="btn ctrl-btn ${this._audioHeld?"muted":""}" @click=${this._toggleAudio}>
                <ha-icon icon="${this._audioHeld?"mdi:volume-off":"mdi:volume-high"}"></ha-icon>
            </ha-icon-button>
        `;return i?l`
                <div class="bottom-bar">
                    <ha-icon-button class="btn deny-btn" @click=${this._hangup}>
                        <ha-icon icon="mdi:phone-hangup"></ha-icon>
                    </ha-icon-button>
                    ${o}
                    ${r}
                    ${c}
                </div>
            `:l`
            <div class="bottom-bar">
                ${o}
                ${r}
                ${c}
            </div>
        `}get _popupSize(){return this._sipCore?.config?.popup_config?.popup_size??"large"}get _popupPosition(){return this._sipCore?.config?.popup_config?.popup_position??"center"}render(){let e=this._popupPosition;return e!=="center"?l`
                <div class="anchored-overlay ${e} size-${this._popupSize} ${this._open?"open":""}">
                    <div class="anchored-dialog">
                        <div class="anchored-header">
                            <span class="title ${this._callState}">
                                ${this._callState==="ringing"?l`<ha-icon class="ring-icon" icon="mdi:phone-ring"></ha-icon> Chiamata in arrivo`:this._callState==="active"?l`<ha-icon icon="mdi:phone-in-talk"></ha-icon> In chiamata`:this._callState==="ended"?l`<ha-icon icon="mdi:phone-hangup"></ha-icon> Chiamata terminata`:l`<ha-icon icon="mdi:doorbell-video"></ha-icon> Videocitofono`}
                            </span>
                            <ha-icon-button @click=${this._close}>
                                <ha-icon icon="mdi:close"></ha-icon>
                            </ha-icon-button>
                        </div>
                        <div class="content">
                            <div class="camera-wrap">
                                ${this._cameraCard??l`<div class="camera-placeholder"><ha-icon icon="mdi:camera-off"></ha-icon></div>`}
                            </div>
                            ${this._renderBottomBar()}
                        </div>
                    </div>
                </div>
            `:l`
            <ha-dialog ?open=${this._open} @closed=${this._close} hideActions flexContent
                class="size-${this._popupSize}">
                <ha-dialog-header slot="heading">
                    <ha-icon-button slot="navigationIcon" @click=${this._close}>
                        <ha-icon icon="mdi:close"></ha-icon>
                    </ha-icon-button>
                    <span slot="title" class="title ${this._callState}">
                        ${this._callState==="ringing"?l`<ha-icon class="ring-icon" icon="mdi:phone-ring"></ha-icon> Chiamata in arrivo`:this._callState==="active"?l`<ha-icon icon="mdi:phone-in-talk"></ha-icon> In chiamata`:this._callState==="ended"?l`<ha-icon icon="mdi:phone-hangup"></ha-icon> Chiamata terminata`:l`<ha-icon icon="mdi:doorbell-video"></ha-icon> Videocitofono`}
                    </span>
                </ha-dialog-header>

                <div class="content">
                    <div class="camera-wrap">
                        ${this._cameraCard??l`<div class="camera-placeholder"><ha-icon icon="mdi:camera-off"></ha-icon></div>`}
                    </div>
                    ${this._renderBottomBar()}
                </div>
            </ha-dialog>
        `}static get styles(){return k`
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
        `}};_([m({type:Boolean})],g.prototype,"_open",2),_([m({type:String})],g.prototype,"_callState",2),_([m({type:Boolean})],g.prototype,"_holding",2),_([m({type:Number})],g.prototype,"_holdProgress",2),_([m({type:Boolean})],g.prototype,"_micMuted",2),_([m({type:Boolean})],g.prototype,"_audioHeld",2),_([m({type:String})],g.prototype,"cameraEntity",2),_([m({type:Object})],g.prototype,"hass",2);customElements.define("hikvision-doorbell-dialog",g);var st=class extends f{constructor(){super(...arguments);this._config={};this._hass=null;this._onSipCoreUpdate=()=>this._applyPopupConfig()}static get styles(){return k`
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
        `}static getStubConfig(){return{hide_button:!1,button_label:"Doorbell",call_state_entity:""}}static getConfigElement(){return document.createElement("hikvision-doorbell-button-editor")}connectedCallback(){super.connectedCallback(),document.querySelector("hikvision-doorbell-dialog")||document.body.appendChild(document.createElement("hikvision-doorbell-dialog")),window.addEventListener("sipcore-update",this._onSipCoreUpdate),this._applyPopupConfig()}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("sipcore-update",this._onSipCoreUpdate)}setConfig(e){this._config=e,this._applyPopupConfig()}_applyPopupConfig(){window.sipCore&&(window.sipCore.config||(window.sipCore.config={}),window.sipCore.config.popup_config||(window.sipCore.config.popup_config={}),this._config.popup_size&&(window.sipCore.config.popup_config.popup_size=this._config.popup_size),this._config.popup_position&&(window.sipCore.config.popup_config.popup_position=this._config.popup_position),this._config.camera_entity&&(window.sipCore.config.popup_config.camera_entity=this._config.camera_entity))}set hass(e){this._hass=e,this.requestUpdate()}get _isRinging(){return!this._hass||!this._config?.call_state_entity?!1:this._hass.states[this._config.call_state_entity]?.state==="ringing"}_renderChips(){let e=this._config?.extra_entities??[];return!e.length||!this._hass?l``:l`
            <div class="chips" @click=${i=>i.stopPropagation()}>
                ${e.map(({entity:i,icon:s})=>{let o=this._hass.states[i];if(!o)return l``;let r=s||o.attributes.icon||"mdi:dots-horizontal",c=o.attributes.friendly_name?`${o.attributes.friendly_name}: ${o.state}`:`${i.split(".")[1]}: ${o.state}`;return l`
                        <div class="chip">
                            <ha-icon icon=${r}></ha-icon>
                            <span>${c}</span>
                        </div>
                    `})}
            </div>
        `}render(){if(this._config?.hide_button)return l``;let e=this._config?.button_label??"Doorbell",i=this._isRinging;return l`
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
        `}_open(){let e=document.querySelector("hikvision-doorbell-dialog");e||(e=document.createElement("hikvision-doorbell-dialog"),document.body.appendChild(e)),this._config?.camera_entity&&(e.cameraEntity=this._config.camera_entity),this._hass&&(e.hass=this._hass),e.openManual()}};customElements.define("hikvision-doorbell-button",st);var L=class extends f{constructor(){super(...arguments);this.config={}}static get styles(){return k`
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
                display: flex; align-items: center; gap: 8px;
            }
            .extra-entity-row ha-selector { flex: 1; }
            .extra-entity-row ha-selector.icon-selector { flex: 0 0 120px; }
            ha-icon-button { --mdc-icon-button-size: 36px; --mdc-icon-size: 20px; }
            .add-btn {
                display: flex; align-items: center; gap: 4px;
                color: var(--primary-color); cursor: pointer;
                font-size: 14px; padding: 4px 0;
                background: none; border: none;
            }
            .add-btn ha-icon { --mdc-icon-size: 20px; color: var(--primary-color); }
        `}setConfig(e){this.config=e}_emit(e){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_selectorChanged(e,i){this._emit({...this.config,[e]:i.detail.value})}_extraEntityChanged(e,i,s){let o=[...this.config.extra_entities??[]];o[e]={...o[e],[i]:s.detail.value},this._emit({...this.config,extra_entities:o})}_addExtraEntity(){let e=[...this.config.extra_entities??[],{entity:"",icon:""}];this._emit({...this.config,extra_entities:e})}_removeExtraEntity(e){let i=(this.config.extra_entities??[]).filter((s,o)=>o!==e);this._emit({...this.config,extra_entities:i})}render(){let e=this.config.extra_entities??[];return l`
            <div class="form">
                <div class="row">
                    <div class="section-label">Button label</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{text:{}}}
                        .value=${this.config.button_label??"Doorbell"}
                        @value-changed=${i=>this._selectorChanged("button_label",i)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Call state entity (ringing animation)</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{entity:{domain:"sensor"}}}
                        .value=${this.config.call_state_entity??""}
                        @value-changed=${i=>this._selectorChanged("call_state_entity",i)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Camera entity (optional)</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{entity:{domain:"camera"}}}
                        .value=${this.config.camera_entity??""}
                        @value-changed=${i=>this._selectorChanged("camera_entity",i)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Popup position</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{select:{options:[{value:"center",label:"Center"},{value:"bottom-left",label:"Bottom left"},{value:"bottom-right",label:"Bottom right"}],mode:"list"}}}
                        .value=${this.config.popup_position??"center"}
                        @value-changed=${i=>this._selectorChanged("popup_position",i)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <div class="section-label">Popup size</div>
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{select:{options:[{value:"large",label:"Large"},{value:"small",label:"Small"}],mode:"list"}}}
                        .value=${this.config.popup_size??"large"}
                        @value-changed=${i=>this._selectorChanged("popup_size",i)}
                    ></ha-selector>
                </div>
                <div class="row">
                    <ha-selector
                        .hass=${this.hass}
                        .selector=${{boolean:{}}}
                        .value=${this.config.hide_button??!1}
                        .label=${"Hide button (popup only on incoming call)"}
                        @value-changed=${i=>this._selectorChanged("hide_button",i)}
                    ></ha-selector>
                </div>

                <div class="row">
                    <div class="section-title">Extra entities (shown as chips)</div>
                    ${e.map((i,s)=>l`
                        <div class="extra-entity-row">
                            <ha-selector
                                .hass=${this.hass}
                                .selector=${{entity:{}}}
                                .value=${i.entity}
                                @value-changed=${o=>this._extraEntityChanged(s,"entity",o)}
                            ></ha-selector>
                            <ha-selector
                                class="icon-selector"
                                .hass=${this.hass}
                                .selector=${{icon:{}}}
                                .value=${i.icon??""}
                                @value-changed=${o=>this._extraEntityChanged(s,"icon",o)}
                            ></ha-selector>
                            <ha-icon-button @click=${()=>this._removeExtraEntity(s)}>
                                <ha-icon icon="mdi:delete"></ha-icon>
                            </ha-icon-button>
                        </div>
                    `)}
                    <button class="add-btn" @click=${this._addExtraEntity}>
                        <ha-icon icon="mdi:plus"></ha-icon> Add entity
                    </button>
                </div>
            </div>
        `}};_([m({attribute:!1})],L.prototype,"config",2),_([m({attribute:!1})],L.prototype,"hass",2);customElements.define("hikvision-doorbell-button-editor",L);function bt(){document.querySelector("hikvision-doorbell-dialog")?console.debug("[hikvision-dialog] dialog already in DOM, skipping"):(console.debug("[hikvision-dialog] creating dialog element in DOM"),document.body.appendChild(document.createElement("hikvision-doorbell-dialog")))}document.body?bt():window.addEventListener("load",bt,{once:!0});console.info("%c HIKVISION-DOORBELL-CARD %c v0.2.6 ","color: white; background: #025a9e; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;","color: #025a9e; background: #e8f4fd; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;");
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
