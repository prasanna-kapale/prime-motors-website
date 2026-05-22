const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/toast-ofNrhuTp.js","assets/toast-BP8glQrk.css"])))=>i.map(i=>d[i]);
import{f as x,s as y}from"./toast-ofNrhuTp.js";import{g as M,b as O,c as F}from"./invoiceService-CdsVTMRA.js";const H="modulepreload",U=function(e){return"/"+e},P={},q=function(n,t,a){let i=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),l=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));i=Promise.allSettled(t.map(c=>{if(c=U(c),c in P)return;P[c]=!0;const d=c.endsWith(".css"),v=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${v}`))return;const r=document.createElement("link");if(r.rel=d?"stylesheet":H,d||(r.as="script"),r.crossOrigin="",r.href=c,l&&r.setAttribute("nonce",l),document.head.appendChild(r),d)return new Promise((u,p)=>{r.addEventListener("load",u),r.addEventListener("error",()=>p(new Error(`Unable to preload CSS for ${c}`)))})}))}function o(s){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=s,window.dispatchEvent(l),!l.defaultPrevented)throw s}return i.then(s=>{for(const l of s||[])l.status==="rejected"&&o(l.reason);return n().catch(o)})};let B=[],m=null,T=!1,g="normal",k="PM-0001",_=[{mode:"Cash",amount:"",ref:""}];const L=new URLSearchParams(window.location.search),C=L.get("car"),A=L.get("view"),V=L.get("print");document.addEventListener("DOMContentLoaded",async()=>{A?await G(A):await W(),Z()});async function W(){try{if(B=await x(),k=await M(),z(),C){const a=document.getElementById("inv_car");a&&(a.value=C,R())}const e=new Date().toISOString().slice(0,10),n=document.getElementById("inv_date");n&&(n.value=e);const t=document.getElementById("inv_time");if(t){const a=new Date,i=String(a.getHours()).padStart(2,"0"),o=String(a.getMinutes()).padStart(2,"0");t.value=`${i}:${o}`}document.getElementById("srNoDisplay").textContent=k,N(),j(),f(),h()}catch(e){console.error(e),y("Failed to load cars","error")}}function j(){var a,i,o,s,l;const e=((a=document.getElementById("inv_car"))==null?void 0:a.closest(".fg-row"))||((i=document.getElementById("inv_car"))==null?void 0:i.parentElement);if(!e)return;const n=document.createElement("div");n.className="fg-row",n.style.marginBottom="16px",n.innerHTML=`
    <div class="fg" style="max-width:340px">
      <label style="font-size:.65rem;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:6px;display:block">Invoice Type</label>
      <div class="inv-type-toggle">
        <button type="button" class="inv-type-btn active" id="invTypeNormal">Normal Sale</button>
        <button type="button" class="inv-type-btn" id="invTypePark">Park &amp; Sell</button>
      </div>
    </div>
  `,e.parentElement.insertBefore(n,e);const t=document.createElement("div");t.className="park-show",t.style.display="none",t.innerHTML=`
    <p class="form-section-label" style="color:#e01e2a;border-color:rgba(224,30,42,.3)">🔑 Park &amp; Sell Details — Internal Only (Not on Print)</p>
    <div class="fg-row">
      <div class="fg"><label>Car Owner Name</label><input class="fi" id="inv_car_owner_name" placeholder="Owner full name"/></div>
      <div class="fg"><label>Car Owner Phone</label><input class="fi" id="inv_car_owner_phone" placeholder="+91 …"/></div>
    </div>
    <div class="fg-row">
      <div class="fg"><label>Commission % *</label>
        <input class="fi" id="inv_commission_pct" type="number" placeholder="e.g. 5" min="0" max="100" step="0.1"/>
      </div>
      <div class="fg"><label>Commission Amount (₹) — Auto</label>
        <input class="fi" id="inv_commission_amt" type="number" placeholder="Auto-calculated" readonly style="opacity:.6"/>
      </div>
      <div class="fg"><label>Owner Payout (₹) — Auto</label>
        <input class="fi" id="inv_owner_payout" type="number" placeholder="Auto-calculated" readonly style="opacity:.6"/>
      </div>
    </div>
    <div class="fg-row">
      <div class="fg"><label>Parking Duration (optional)</label>
        <input class="fi" id="inv_parking_duration" placeholder="e.g. 15 days"/>
      </div>
    </div>
  `,e.insertAdjacentElement("afterend",t),(o=document.getElementById("invTypeNormal"))==null||o.addEventListener("click",()=>E("normal")),(s=document.getElementById("invTypePark"))==null||s.addEventListener("click",()=>E("park_sell")),(l=document.getElementById("inv_commission_pct"))==null||l.addEventListener("input",()=>{S(),h()})}function z(){const e=document.getElementById("inv_car");e&&(e.innerHTML='<option value="">— Manual Entry (no inventory car) —</option>'+B.map(n=>`<option value="${n.id}"
      data-brand="${n.brand}" data-model="${n.model}" data-year="${n.year}"
      data-color="${n.color||""}" data-fuel="${n.fuel}" data-price="${n.price}">
      ${n.brand} ${n.model} (${n.year}) — ₹${n.price}L
    </option>`).join(""))}function R(){const e=document.getElementById("inv_car");if(!(e!=null&&e.value)){m=null;return}const n=parseInt(e.value);if(m=B.find(i=>i.id===n)||null,!m)return;const t=(i,o)=>{const s=document.getElementById(i);s&&!s.value&&(s.value=o||"")};t("inv_model",`${m.brand} ${m.model}`),t("inv_makers",m.brand),t("inv_colour",m.color);const a=document.getElementById("inv_total");a&&!a.value&&(a.value=Math.round(m.price*1e5)),f()}async function G(e){T=!0;try{const n=await O(e);if(!n){y("Invoice not found","error");return}const t=document.getElementById("invFormPanel");t&&(t.style.display="none"),Y(n),V&&setTimeout(()=>window.print(),600)}catch(n){console.error(n),y("Failed to load invoice","error")}}function N(){const e=document.getElementById("paymentRows");e&&(e.innerHTML=_.map((n,t)=>`
    <div class="pay-row">
      <select class="fs pay-mode" data-pidx="${t}">
        <option value="Cash" ${n.mode==="Cash"?"selected":""}>Cash</option>
        <option value="Online" ${n.mode==="Online"?"selected":""}>Online / UPI</option>
        <option value="Cheque" ${n.mode==="Cheque"?"selected":""}>Cheque</option>
        <option value="Finance" ${n.mode==="Finance"?"selected":""}>Finance / Loan</option>
      </select>
      <input class="fi pay-amount" type="number" placeholder="Amount ₹" value="${n.amount||""}" data-pidx="${t}" />
      <input class="fi pay-ref" placeholder="Ref / Cheque No (optional)" value="${n.ref||""}" data-pidx="${t}" />
      ${_.length>1?`<button class="pay-rm" data-pidx="${t}">✕</button>`:"<div></div>"}
    </div>`).join(""),f())}function K(){_.push({mode:"Cash",amount:"",ref:""}),N()}function $(e){const n=e.target,t=parseInt(n.dataset.pidx);isNaN(t)||(n.classList.contains("pay-mode")&&(_[t].mode=n.value),n.classList.contains("pay-amount")&&(_[t].amount=n.value),n.classList.contains("pay-ref")&&(_[t].ref=n.value),n.classList.contains("pay-rm")&&(_.splice(t,1),N()),f(),h())}function f(){var s,l;const e=parseFloat((s=document.getElementById("inv_total"))==null?void 0:s.value)||0,n=parseFloat((l=document.getElementById("inv_advance"))==null?void 0:l.value)||0,t=e-n,a=document.getElementById("inv_balance");a&&(a.value=t>0?t.toFixed(0):"0");const i=_.reduce((c,d)=>c+(parseFloat(d.amount)||0),0),o=document.getElementById("inv_paid_display");o&&(o.textContent=`₹${i.toLocaleString("en-IN")}`)}async function J(){const e=r=>{var u,p;return((p=(u=document.getElementById(r))==null?void 0:u.value)==null?void 0:p.trim())||""},n=r=>{var u;return parseFloat((u=document.getElementById(r))==null?void 0:u.value)||0},t=e("inv_purchaser_name"),a=e("inv_purchaser_mob");if(!t){y("Enter purchaser name","error");return}if(!a){y("Enter purchaser mobile","error");return}const i=n("inv_total");if(i<=0){y("Enter total amount","error");return}const o=document.getElementById("saveBtn");o&&(o.disabled=!0,o.textContent="⏳ Saving…");const s=_.filter(r=>r.amount&&parseFloat(r.amount)>0);s.map(r=>r.mode).join(" / ");const l=g==="park_sell"?parseFloat(e("inv_commission_pct"))||0:null,c=g==="park_sell"?Math.round(i*(l/100)):null,d=g==="park_sell"?Math.round(i-c):null,v={sr_no:k,sale_date:e("inv_date")||new Date().toISOString().slice(0,10),sale_time:e("inv_time"),car_id:(m==null?void 0:m.id)||null,registered_owner:e("inv_reg_owner"),owner_so:e("inv_owner_so"),owner_ro:e("inv_owner_ro"),reg_no:e("inv_reg_no"),model_name:e("inv_model"),class_of_vehicle:e("inv_class"),makers_name:e("inv_makers"),chassis_no:e("inv_chassis"),date_of_registration:e("inv_doreg"),engine_no:e("inv_engine"),type_of_body:e("inv_bodytype"),colour:e("inv_colour"),other_info:e("inv_other"),total_amount:i,total_amount_words:e("inv_amount_words"),advance:n("inv_advance"),balance:n("inv_balance"),payments:s,through_dealer:e("inv_dealer"),shop_name:e("inv_shop"),dealer_mobile:e("inv_dealer_mob"),seller_name:e("inv_seller_name"),seller_so:e("inv_seller_so"),seller_address:e("inv_seller_addr"),seller_mobile:e("inv_seller_mob"),purchaser_name:t,purchaser_so:e("inv_purchaser_so"),purchaser_address:e("inv_purchaser_addr"),purchaser_mobile:a,brokerage:parseFloat(e("inv_brokerage"))||null,broker_name:e("inv_broker"),admin_notes:e("inv_admin_notes"),invoice_type:g,commission_percentage:l,commission_amount:c,owner_payout:d,car_owner_name:g==="park_sell"?e("inv_car_owner_name"):null,car_owner_phone:g==="park_sell"?e("inv_car_owner_phone"):null,parking_duration:g==="park_sell"?e("inv_parking_duration"):null};console.log("[handleSave] Invoice payload:",JSON.stringify(v,null,2));try{console.log("[handleSave] Calling createInvoice...");const r=await F(v);if(m!=null&&m.id){const{deleteCar:p}=await q(async()=>{const{deleteCar:b}=await import("./toast-ofNrhuTp.js").then(w=>w.i);return{deleteCar:b}},__vite__mapDeps([0,1]));await p(m.id)}console.log("[handleSave] Success! Saved invoice id:",r==null?void 0:r.id);const u=v.car_id?"✅ Invoice saved! Car marked sold.":"✅ Invoice saved!";y(u,"success"),setTimeout(()=>{window.open(`invoice.html?view=${r.id}`,"_blank"),window.location.href="admin.html"},1200)}catch(r){console.error("[handleSave] FAILED:",(r==null?void 0:r.message)||r),y("❌ Save failed: "+((r==null?void 0:r.message)||"Unknown error"),"error"),o&&(o.disabled=!1,o.textContent="💾 SAVE INVOICE")}}function Y(e){const n=document.getElementById("printDocWrap");if(!n)return;const t=Array.isArray(e.payments)&&e.payments.length&&e.payments.filter(a=>a.amount&&parseFloat(a.amount)>0).map(a=>`${a.mode} ₹${Number(a.amount).toLocaleString("en-IN")}${a.ref?" ("+a.ref+")":""}`).join(" + ")||"—";n.innerHTML=D(e,t)}function D(e,n){const t=(o,s,l="")=>`<div class="inv-field ${l}">
      <span class="inv-label">${o}</span>
      <span class="inv-line">${s||""}</span>
    </div>`,a=(o,s,l,c)=>`<div class="inv-field-pair">
      ${t(o,s)}
      ${t(l,c)}
    </div>`,i=o=>(Number(o)||0).toLocaleString("en-IN",{maximumFractionDigits:0});return`<div class="invoice-doc" id="invoiceDoc">

    <!-- WATERMARK: grayscale logo, 7% opacity -->
    <div class="doc-watermark">
      <img src="/logo-wm.png" alt="" />
    </div>

    <!-- HEADER: logo top-center, no box/shadow -->
    <div class="doc-header">
      <div class="doc-header-left">
        <div class="doc-srno-row">
          Sr. No. : <span class="sr-red">${e.sr_no||""}</span>
        </div>
        <div class="doc-meta-row">
          <strong>Date :</strong>
          <span class="meta-line">${e.sale_date?new Date(e.sale_date+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}):""}</span>
        </div>
        <div class="doc-meta-row">
          <strong>Time :</strong>
          <span class="meta-line">${e.sale_time||""}</span>
        </div>
      </div>

      <div class="doc-header-center">
        <!-- Width 170px, no shadow/border, clean on white -->
        <img class="doc-logo" src="/logo-black.png" alt="Prime Motors" />
        <div class="doc-tagline">DEALS ON WHEELS</div>
      </div>

      <div class="doc-header-right">
        <div style="font-weight:800; color:#b30000; font-size:10px; letter-spacing:1px; margin-bottom:3px;">PRIME MOTORS</div>
        <div>Beside CBC Mall, Nagpur Road</div>
        <div>Chandrapur, MH 442401</div>
        <div>primemotor666@gmail.com</div>
        <div>+91 97666 19309</div>
      </div>
    </div>

    <!-- Thin red accent line below header -->
    <div class="doc-header-line"></div>

    <!-- TITLE -->
    <div class="doc-title-block">
      <div class="doc-title">Delivery Note Cum Intermediator Receipt</div>
      <div class="doc-subtitle">I/We after Satisfying my self / ourself have taken delivery of Car / M. Cycle / Scooter</div>
    </div>

    <!-- BODY -->
    <div class="doc-body">

      <!-- REGISTERED OWNER -->
      <div class="doc-section">
        <div class="doc-section-header">Registered Owner</div>
        ${t("Registered Owner",e.registered_owner,"full-width")}
        ${a("S/o",e.owner_so,"R/o",e.owner_ro)}
      </div>

      <!-- VEHICLE DETAILS -->
      <div class="doc-section">
        <div class="doc-section-header">Vehicle Details</div>
        ${a("Bearing Reg. No",e.reg_no,"Model",e.model_name)}
        ${a("1. Class of Vehicle",e.class_of_vehicle,"2. Maker's Name",e.makers_name)}
        ${a("3. Chassis No",e.chassis_no,"4. Date of Registration",e.date_of_registration)}
        ${a("5. Engine No",e.engine_no,"6. Type of Body",e.type_of_body)}
        ${a("7. Colour of Vehicle",e.colour,"8. Other",e.other_info)}
      </div>

      <!-- FINANCIALS -->
      <div class="doc-section">
        <div class="doc-section-header">Financial Details</div>
        <div class="financials-block">
          <div class="inv-total-row">
            <div class="inv-total-box">
              <span class="inv-label" style="font-size:11px">9. Total Amount :</span>
              <span class="inv-amount-box">₹${i(e.total_amount)}</span>
            </div>
            <div class="inv-words-field">
              <span class="inv-label">(In words)</span>
              <span class="inv-line">${e.total_amount_words||""}</span>
            </div>
          </div>
          ${a("10. Advance :",e.advance?"₹"+i(e.advance):"","Balance",e.balance?"₹"+i(e.balance):"")}
        </div>

        <div class="payment-received-row">
          <span class="inv-label">Received with Cash / Cheque / Online payment :</span>
          <span class="inv-line">${n||""}</span>
        </div>
      </div>

      <!-- DEALER -->
      <div class="doc-section">
        <div class="doc-section-header">Dealer Information</div>
        <div class="dealer-strip">
          ${t("Through Dealer",e.through_dealer)}
          ${t("Shop Name",e.shop_name)}
          ${t("Mobile No.",e.dealer_mobile)}
          <div class="inv-field"><span class="inv-label">T. Dealers Signature</span><span class="inv-sig-line"></span></div>
        </div>
      </div>

      <!-- SELLER / PURCHASER -->
      <div class="doc-addresses">
        <div class="doc-addr-col">
          <div class="addr-heading">Seller Address</div>
          ${t("Name",e.seller_name)}
          ${t("S/o",e.seller_so)}
          ${t("Add",e.seller_address)}
          ${t("Mob.",e.seller_mobile)}
          <div class="sig-row"><span class="sig-label">Seller's Signature</span></div>
        </div>
        <div class="doc-addr-col">
          <div class="addr-heading">Purchaser Address</div>
          ${t("Name",e.purchaser_name)}
          ${t("S/o",e.purchaser_so)}
          ${t("Add",e.purchaser_address)}
          ${t("Mob.",e.purchaser_mobile)}
          <div class="sig-row"><span class="sig-label">Purchaser Signature</span></div>
        </div>
      </div>

      <!-- PARK & SELL: admin-only block (screen only, hidden in print) -->
      ${e.invoice_type==="park_sell"?`
      <div class="doc-section park-sell-admin-block">
        <div class="doc-section-header" style="color:#e01e2a">Park &amp; Sell — Internal Details (Not Printed)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:10px;color:#444">
          <div><strong>Car Owner:</strong> ${e.car_owner_name||"—"}</div>
          <div><strong>Owner Phone:</strong> ${e.car_owner_phone||"—"}</div>
          <div><strong>Commission:</strong> ${e.commission_percentage||0}% = ₹${(Number(e.commission_amount)||0).toLocaleString("en-IN")}</div>
          <div><strong>Owner Payout:</strong> ₹${(Number(e.owner_payout)||0).toLocaleString("en-IN")}</div>
          ${e.parking_duration?`<div><strong>Parking Duration:</strong> ${e.parking_duration}</div>`:""}
        </div>
      </div>`:""}

      <!-- AUTHORIZED SIGNATURE / STAMP (right-aligned) -->
      <div class="doc-auth-stamp">
        <div class="doc-stamp-box">
          <div class="doc-stamp-space"></div>
          <div class="doc-stamp-label">Authorized Signature</div>
          <div class="doc-stamp-sublabel">For Prime Motors</div>
        </div>
      </div>

    </div><!-- /doc-body -->
  </div>`}function S(){var s,l;const e=parseFloat((s=document.getElementById("inv_total"))==null?void 0:s.value)||0,n=parseFloat((l=document.getElementById("inv_commission_pct"))==null?void 0:l.value)||0,t=Math.round(e*n/100),a=Math.round(e-t),i=document.getElementById("inv_commission_amt"),o=document.getElementById("inv_owner_payout");i&&(i.value=t),o&&(o.value=a)}function E(e){g=e;const n=document.querySelectorAll(".park-hide"),t=document.querySelectorAll(".park-show"),a=document.getElementById("invTypeNormal"),i=document.getElementById("invTypePark");e==="park_sell"?(n.forEach(o=>o.style.display="none"),t.forEach(o=>o.style.display=""),a&&a.classList.remove("active"),i&&i.classList.add("active")):(n.forEach(o=>o.style.display=""),t.forEach(o=>o.style.display="none"),a&&a.classList.add("active"),i&&i.classList.remove("active")),h()}function h(){var c;if(T)return;const e=d=>{var v,r;return((r=(v=document.getElementById(d))==null?void 0:v.value)==null?void 0:r.trim())||""},n=d=>{var v;return parseFloat((v=document.getElementById(d))==null?void 0:v.value)||0},t=n("inv_total"),a=n("inv_advance"),i=t-a,o=_.filter(d=>d.amount&&parseFloat(d.amount)>0).map(d=>`${d.mode} ₹${Number(d.amount).toLocaleString("en-IN")}${d.ref?" ("+d.ref+")":""}`).join(" + "),s={sr_no:((c=document.getElementById("srNoDisplay"))==null?void 0:c.textContent)||"",sale_date:e("inv_date"),sale_time:e("inv_time"),registered_owner:e("inv_reg_owner"),owner_so:e("inv_owner_so"),owner_ro:e("inv_owner_ro"),reg_no:e("inv_reg_no"),model_name:e("inv_model"),class_of_vehicle:e("inv_class"),makers_name:e("inv_makers"),chassis_no:e("inv_chassis"),date_of_registration:e("inv_doreg"),engine_no:e("inv_engine"),type_of_body:e("inv_bodytype"),colour:e("inv_colour"),other_info:e("inv_other"),total_amount:t,total_amount_words:e("inv_amount_words"),advance:a,balance:i>0?i:0,through_dealer:e("inv_dealer"),shop_name:e("inv_shop"),dealer_mobile:e("inv_dealer_mob"),seller_name:e("inv_seller_name"),seller_so:e("inv_seller_so"),seller_address:e("inv_seller_addr"),seller_mobile:e("inv_seller_mob"),purchaser_name:e("inv_purchaser_name"),purchaser_so:e("inv_purchaser_so"),purchaser_address:e("inv_purchaser_addr"),purchaser_mobile:e("inv_purchaser_mob")},l=document.getElementById("printDocWrap");l&&(l.innerHTML=D(s,o))}function Z(){var n,t,a,i,o,s,l,c,d,v,r,u,p,b;(n=document.getElementById("inv_car"))==null||n.addEventListener("change",R),(t=document.getElementById("inv_total"))==null||t.addEventListener("input",()=>{f(),h()}),(a=document.getElementById("inv_advance"))==null||a.addEventListener("input",()=>{f(),h()}),["inv_date","inv_time","inv_reg_owner","inv_owner_so","inv_owner_ro","inv_reg_no","inv_model","inv_class","inv_makers","inv_chassis","inv_doreg","inv_engine","inv_bodytype","inv_colour","inv_other","inv_amount_words","inv_dealer","inv_shop","inv_dealer_mob","inv_seller_name","inv_seller_so","inv_seller_addr","inv_seller_mob","inv_purchaser_name","inv_purchaser_so","inv_purchaser_addr","inv_purchaser_mob"].forEach(w=>{const I=document.getElementById(w);I&&(I.addEventListener("input",h),I.addEventListener("change",h))}),(i=document.getElementById("paymentRows"))==null||i.addEventListener("change",$),(o=document.getElementById("paymentRows"))==null||o.addEventListener("click",$),(s=document.getElementById("paymentRows"))==null||s.addEventListener("input",$),(l=document.getElementById("addPayRowBtn"))==null||l.addEventListener("click",K),(c=document.getElementById("saveBtn"))==null||c.addEventListener("click",J),(d=document.getElementById("invTypeNormal"))==null||d.addEventListener("click",()=>E("normal")),(v=document.getElementById("invTypePark"))==null||v.addEventListener("click",()=>E("park_sell")),(r=document.getElementById("inv_commission_pct"))==null||r.addEventListener("input",S),(u=document.getElementById("inv_total"))==null||u.addEventListener("input",S),(p=document.getElementById("printBtn"))==null||p.addEventListener("click",()=>window.print()),(b=document.getElementById("backBtn"))==null||b.addEventListener("click",()=>{window.location.href="admin.html"})}
