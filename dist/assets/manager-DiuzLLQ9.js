import{s as m,c as A,d as P,u as q,e as R,g as G}from"./toast-ofNrhuTp.js";/* empty css              */import{f as H,a as X}from"./invoiceService-CdsVTMRA.js";import{C as z,f as V,b as W,c as j,u as x,d as Z}from"./config-CDgV_J-U.js";const N=sessionStorage.getItem("role");window.location.pathname.includes("admin")&&N==="manager"&&(window.location.href="/manager");window.location.pathname.includes("manager")&&N==="owner"&&(window.location.href="/admin");let b=[],$=[],Y=[],p=[],g=null,_=!1,l={};document.addEventListener("DOMContentLoaded",()=>{J(),U(),ee(),ae(),Q()});function J(){const e=t=>document.getElementById(t);l={gateOv:e("gateOv"),gateIn:e("gateIn"),gateErr:e("gateErr"),admContent:e("admContent"),logoutBtn:e("logoutBtn"),upZone:e("upZone"),imgIn:e("imgIn"),prevGrid:e("prevGrid"),upCnt:e("upCnt"),admTbody:e("admTbody"),invBadge:e("invBadge"),tblEmpty:e("tblEmpty"),tableSearch:e("tableSearch"),formTitle:e("formTitle"),formSubtitle:e("formSubtitle"),submitBtn:e("submitBtn"),cancelBtn:e("cancelBtn"),invoiceList:e("invoiceList"),dashStats:e("dashStats"),recentDeals:e("recentDeals"),leadsSection:e("leadsSection"),leadFilterCar:e("leadFilterCar")}}function U(){const e=sessionStorage.getItem("role");if(window.location.pathname.includes("manager")&&e==="manager"){T();return}l.gateOv.classList.remove("hidden"),l.gateIn.focus(),l.gateIn.addEventListener("keydown",n=>{n.key==="Enter"&&I()}),document.getElementById("gateBtn").addEventListener("click",I)}function T(){l.gateOv.classList.add("hidden"),l.admContent.style.display="block",l.logoutBtn.style.display="block",K()}function I(){l.gateIn.value.trim()===z.MANAGER_PASSWORD?(sessionStorage.setItem("role","manager"),T()):(l.gateErr.classList.add("on"),l.gateIn.value="",l.gateIn.focus(),setTimeout(()=>l.gateErr.classList.remove("on"),3e3))}var S;(S=document.getElementById("logoutBtn"))==null||S.addEventListener("click",()=>{sessionStorage.removeItem("role"),window.location.href="/admin"});async function K(){m("⏳ Loading…","info");try{const[e,t]=await Promise.all([A(),H()]);b=e,$=t,h(),ce(),L(),await Promise.all([E(),v()]),m("✅ Loaded","success")}catch(e){console.error(e),m("❌ Load failed. Check Supabase credentials.","error")}}async function E(){try{oe(await X())}catch{}}async function v(e=null){try{const[t,n,r]=await Promise.all([V(),W(),j(30)]);Y=r,ie(t,n,e?r.filter(d=>d.car_id==e):r)}catch{}}function Q(){document.querySelectorAll(".adm-tab-btn").forEach(e=>e.addEventListener("click",()=>D(e.dataset.tab)))}function D(e){document.querySelectorAll(".adm-tab-btn").forEach(t=>t.classList.toggle("active",t.dataset.tab===e)),document.querySelectorAll(".adm-tab-pane").forEach(t=>t.classList.toggle("active",t.id===`tab-${e}`)),e==="leads"&&v()}function ee(){const e=l.upZone;e&&(e.addEventListener("dragover",t=>{t.preventDefault(),e.classList.add("drag")}),e.addEventListener("dragleave",t=>{e.contains(t.relatedTarget)||e.classList.remove("drag")}),e.addEventListener("drop",async t=>{t.preventDefault(),e.classList.remove("drag"),await k(Array.from(t.dataTransfer.files))}),l.imgIn.addEventListener("change",async t=>{await k(Array.from(t.target.files)),t.target.value=""}))}async function k(e){const t=e.filter(n=>n.type.startsWith("image/"));for(const n of t){const r=await P(n),d=new FileReader;d.onload=c=>{p.push({file:r,src:c.target.result}),y()},d.readAsDataURL(r)}}function te(e){p.splice(e,1),y()}function y(){const{prevGrid:e,upCnt:t}=l;if(e){if(!p.length){e.innerHTML="",t.style.display="none";return}e.innerHTML=p.map((n,r)=>`
    <div class="prev-slot"><img src="${n.src}"/>
    <button class="rm" data-rmidx="${r}">✕</button></div>`).join(""),t.style.display="block",t.textContent=`${p.length} photo${p.length!==1?"s":""} selected`}}function ae(){var e,t,n,r,d,c,a;document.addEventListener("click",s=>{const o=s.target.closest("[data-broker]");if(!o)return;const i=JSON.parse(o.dataset.broker);be(i)}),(e=l.prevGrid)==null||e.addEventListener("click",s=>{const o=s.target.closest("[data-rmidx]");o&&te(parseInt(o.dataset.rmidx))}),(t=l.admTbody)==null||t.addEventListener("click",s=>{const o=s.target.closest("[data-action]");if(!o)return;const i=parseInt(o.dataset.id);o.dataset.action==="edit"&&le(i),o.dataset.action==="delete"&&re(i),o.dataset.action==="invoice"&&(window.location.href=`invoice.html?car=${i}`)}),(n=l.tableSearch)==null||n.addEventListener("input",s=>h(s.target.value)),(r=l.submitBtn)==null||r.addEventListener("click",se),(d=l.cancelBtn)==null||d.addEventListener("click",de),(c=l.leadFilterCar)==null||c.addEventListener("change",s=>v(s.target.value||null)),(a=document.getElementById("addManualLeadBtn"))==null||a.addEventListener("click",M),el.querySelectorAll(".lead-status-sel").forEach(s=>{s.addEventListener("change",async o=>{const i=parseInt(s.dataset.leadId),u=s.value;try{await x(i,u),s.style.borderColor=u==="New"?"rgba(204,30,30,.4)":u==="Contacted"?"rgba(251,191,36,.4)":"rgba(34,197,94,.4)",s.style.color=u==="New"?"var(--red)":u==="Contacted"?"#fbbf24":"#22C55E"}catch(f){console.error("Status update failed:",f)}})})}function ne(){var n,r,d,c,a,s;const e=o=>{var i,u;return((u=(i=document.getElementById(o))==null?void 0:i.value)==null?void 0:u.trim())||""},t=o=>{var i;return parseFloat((i=document.getElementById(o))==null?void 0:i.value)||null};return{brand:e("a_brand"),model:e("a_model"),year:parseInt((n=document.getElementById("a_year"))==null?void 0:n.value)||null,price:parseFloat((r=document.getElementById("a_price"))==null?void 0:r.value)||null,km:e("a_km")||"N/A",fuel:((d=document.getElementById("a_fuel"))==null?void 0:d.value)||"Petrol",trans:((c=document.getElementById("a_trans"))==null?void 0:c.value)||"Automatic",color:e("a_color"),owner:((a=document.getElementById("a_owner"))==null?void 0:a.value)||"1st Owner",business_type:((s=document.getElementById("a_btype"))==null?void 0:s.value)||"owned",buy_price:t("a_buyprice"),brokerage:t("a_brokerage"),broker_name:e("a_broker")}}async function se(){if(_)return;const e=ne();if(!e.brand||!e.model||!e.year||!e.price){m("Fill Brand, Model, Year & Price","error");return}_=!0,l.submitBtn.disabled=!0,l.submitBtn.textContent="⏳ Saving…";try{const t=p.map(n=>n.file).filter(n=>n instanceof File);g!==null?(await q(g,{...e,images:p.map(n=>n.src)},t),m(`✅ ${e.brand} ${e.model} updated!`,"success")):(await R(e,t),m(`✅ ${e.brand} ${e.model} added!`,"success")),b=await A(),h(),L(),E(),w()}catch(t){console.error(t),m("❌ Save failed","error")}finally{_=!1,l.submitBtn.disabled=!1,l.submitBtn.textContent=g?"✓ SAVE CHANGES":"+ ADD TO INVENTORY"}}function le(e){var d;const t=b.find(c=>c.id===e);if(!t)return;g=e;const n=(c,a)=>{const s=document.getElementById(c);s&&(s.value=a||"")};n("a_brand",t.brand),n("a_model",t.model),n("a_year",t.year),n("a_price",t.price),n("a_km",t.km!=="N/A"?t.km:""),n("a_color",t.color),n("a_broker",t.broker_name),n("a_buyprice",t.buy_price||""),n("a_brokerage",t.brokerage||"");const r=(c,a)=>{const s=document.getElementById(c);s&&(s.value=a)};r("a_fuel",t.fuel),r("a_trans",t.trans),r("a_owner",t.owner),r("a_btype",t.business_type||"owned"),p=(t.images||[]).map((c,a)=>({src:c,name:`existing-${a}`,file:null})),y(),l.formTitle.textContent="EDIT CAR",l.formSubtitle.textContent=`Editing: ${t.brand} ${t.model}`,l.submitBtn.textContent="✓ SAVE CHANGES",l.cancelBtn.style.display="block",(d=document.querySelector(".adm-form-wrap"))==null||d.scrollIntoView({behavior:"smooth",block:"start"}),D("add")}function de(){g=null,w()}function w(){g=null,p=[],["a_brand","a_model","a_year","a_price","a_km","a_color","a_buyprice","a_brokerage","a_broker"].forEach(e=>{const t=document.getElementById(e);t&&(t.value="")}),[["a_fuel","Petrol"],["a_trans","Automatic"],["a_owner","1st Owner"],["a_btype","owned"]].forEach(([e,t])=>{const n=document.getElementById(e);n&&(n.value=t)}),y(),l.formTitle.textContent="ADD NEW CAR",l.formSubtitle.textContent="Fill details below",l.submitBtn.textContent="+ ADD TO INVENTORY",l.cancelBtn.style.display="none"}async function re(e){const t=b.find(n=>n.id===e);if(!(!t||!confirm(`Remove ${t.brand} ${t.model}?`)))try{await G(e),b=b.filter(n=>n.id!==e),h(),L(),E(),g===e&&w(),m(`🗑 ${t.brand} ${t.model} removed`,"info")}catch{m("❌ Delete failed","error")}}function h(e=""){var a;const{admTbody:t,invBadge:n,tblEmpty:r}=l;if(!t)return;const d=(e||((a=l.tableSearch)==null?void 0:a.value)||"").toLowerCase(),c=b.filter(s=>!d||s.brand.toLowerCase().includes(d)||s.model.toLowerCase().includes(d)||String(s.year).includes(d));if(n.textContent=`${b.length} Cars`,!b.length){t.innerHTML="",r.style.display="block";return}r.style.display="none",t.innerHTML=c.map(s=>{var u,f;const o=s.status==="sold",i=s.business_type==="consignment"?'<span style="font-size:.6rem;background:rgba(251,191,36,.15);border:1px solid rgba(251,191,36,.4);color:#fbbf24;padding:2px 6px;margin-left:4px">CONSIGN</span>':"";return`<tr class="${o?"row-sold":""}">
      <td><img class="t-thumb" src="${((u=s.images)==null?void 0:u[0])||""}" alt="${s.brand}"/></td>
      <td>
        <div class="t-name">${s.brand} ${s.model}${o?'<span class="t-sold-tag">SOLD</span>':""}${i}</div>
        <div class="t-sub">${s.year} · ${s.km}${s.color?" · "+s.color:""}</div>
        ${s.buy_price?`<div class="t-sub" style="color:#fbbf24">Buy: ₹${s.buy_price}L${s.broker_name?" · Broker: "+s.broker_name:""}</div>`:""}
      </td>
      <td class="t-price">₹${s.price}L</td>
      <td class="t-fuel-col">${s.fuel}<br><span class="t-trans">${s.trans}</span></td>
      <td><span class="p-badge">📷 ${((f=s.images)==null?void 0:f.length)||0}</span></td>
      <td><div class="t-acts">
        ${o?"":`<button class="t-btn t-edit" data-action="edit" data-id="${s.id}">Edit</button>
        <button class="t-btn t-invoice" data-action="invoice" data-id="${s.id}">Invoice</button>`}
        <button class="t-btn t-del" data-action="delete" data-id="${s.id}">Delete</button>
      </div></td>
    </tr>`}).join("")}function oe(e){const t=l.dashStats;t&&(t.innerHTML=`
    <div class="dash-stat">
      <span class="ds-num">${e.totalCars}</span>
      <small>Total Cars</small>
    </div>

    <div class="dash-stat">
      <span class="ds-num" style="color:#22C55E">${e.activeCars}</span>
      <small>Available</small>
    </div>

    <div class="dash-stat">
      <span class="ds-num" style="color:var(--red)">${e.soldCars}</span>
      <small>Sold</small>
    </div>
  `)}function L(){const e=l.leadFilterCar;e&&(e.innerHTML='<option value="">All Cars</option>'+b.map(t=>`<option value="${t.id}">${t.brand} ${t.model} (${t.year})</option>`).join(""))}function ie(e,t,n){var c;const r=l.leadsSection;if(!r)return;const d=a=>({whatsapp_card:"💬 WA Card",whatsapp_detail:"💬 WA Detail",whatsapp_banner:"💬 WA Banner",whatsapp_inquiry:"💬 WA Inquiry",call_card:"📞 Call Card",call_detail:"📞 Call Detail",manual:"✏️ Manual"})[a]||a;r.innerHTML=`
    <div class="leads-stats-row">
      <div class="lead-stat-card"><div class="lead-stat-num">${e}</div><div class="lead-stat-lbl">Total Leads</div></div>
      <div class="lead-stat-card"><div class="lead-stat-num">${n.filter(a=>a.source.includes("whatsapp")).length}</div><div class="lead-stat-lbl">WhatsApp</div></div>
      <div class="lead-stat-card"><div class="lead-stat-num">${n.filter(a=>a.source.includes("call")).length}</div><div class="lead-stat-lbl">Calls</div></div>
      <div class="lead-stat-card"><div class="lead-stat-num">${n.filter(a=>a.source==="manual").length}</div><div class="lead-stat-lbl">Manual</div></div>
    </div>
    <!-- Manual lead entry form -->
    <div class="manual-lead-form">
      <h3 class="leads-panel-title">Add Manual Lead</h3>
      <div class="manual-lead-row">
        <div class="fg"><label>Customer Name</label><input class="fi" id="ml_name" placeholder="Name"/></div>
        <div class="fg"><label>Phone</label><input class="fi" id="ml_phone" placeholder="+91 XXXXX XXXXX"/></div>
        <div class="fg"><label>Car</label>
          <select class="fs" id="ml_car">
            <option value="">— General Enquiry —</option>
            ${b.filter(a=>a.status==="available").map(a=>`<option value="${a.id}" data-brand="${a.brand}" data-model="${a.model}" data-price="${a.price}">${a.brand} ${a.model} (${a.year})</option>`).join("")}
          </select>
        </div>
        <div class="fg"><label>Notes</label><input class="fi" id="ml_notes" placeholder="Any notes…"/></div>
        <button class="t-btn t-edit" id="addManualLeadBtn" style="align-self:flex-end;padding:9px 16px;white-space:nowrap">+ Add Lead</button>
      </div>
    </div>
    <div class="leads-grid">
      <div class="leads-panel">
        <h3 class="leads-panel-title">Top Cars by Leads</h3>
        ${t.length?`<table class="adm-table">
          <thead><tr><th>Car</th><th>Price</th><th>Leads</th></tr></thead>
          <tbody>${t.slice(0,10).map(a=>`<tr>
            <td><strong>${a.brand} ${a.model}</strong></td>
            <td style="color:rgba(255,255,255,.4)">₹${a.price}L</td>
            <td><div style="display:flex;align-items:center;gap:8px">
              <div style="width:${Math.min(a.count*14,140)}px;height:6px;background:var(--red);border-radius:3px"></div>
              <strong style="color:var(--red)">${a.count}</strong>
            </div></td>
          </tr>`).join("")}</tbody>
        </table>`:'<p class="tbl-empty" style="display:block">No leads yet.</p>'}
      </div>
      <div class="leads-panel">
        <h3 class="leads-panel-title">Recent Leads <small style="font-size:.6rem;color:rgba(255,255,255,.3);font-weight:400">— newest first</small></h3>
        ${n.length?`<table class="adm-table">
          <thead><tr><th>Time</th><th>Car</th><th>Customer</th><th>Source</th><th>Status</th></tr></thead>
          <tbody>${n.slice(0,30).map(a=>`<tr>
            <td style="font-size:.72rem;color:rgba(255,255,255,.4);white-space:nowrap">${F(a.created_at)}</td>
            <td><strong>${a.brand} ${a.model}</strong>${a.price?`<br><span style="color:rgba(255,255,255,.3);font-size:.68rem">₹${a.price}L</span>`:""}</td>
            <td style="font-size:.78rem">${a.customer_name||"—"}<br><span style="color:rgba(255,255,255,.35)">${a.customer_phone||""}</span></td>
            <td><span class="lead-source-badge lead-source-${a.source.split("_")[0]}">${d(a.source)}</span></td>
            <td>
              <select class="lead-status-sel" data-lead-id="${a.id}" style="background:#111;border:1px solid ${a.lead_status==="New"?"rgba(204,30,30,.4)":a.lead_status==="Contacted"?"rgba(251,191,36,.4)":"rgba(34,197,94,.4)"};color:${a.lead_status==="New"?"var(--red)":a.lead_status==="Contacted"?"#fbbf24":"#22C55E"};font-size:.65rem;padding:3px 6px;border-radius:2px">
                <option value="New" ${a.lead_status==="New"?"selected":""}>🔴 New</option>
                <option value="Contacted" ${a.lead_status==="Contacted"?"selected":""}>🟡 Contacted</option>
                <option value="Closed" ${a.lead_status==="Closed"?"selected":""}>🟢 Closed</option>
              </select>
            </td>
          </tr>`).join("")}</tbody>
        </table>`:'<p class="tbl-empty" style="display:block">No leads.</p>'}
      </div>
    </div>`,(c=document.getElementById("addManualLeadBtn"))==null||c.addEventListener("click",M),r.querySelectorAll(".lead-status-sel").forEach(a=>{a.addEventListener("change",async s=>{const o=parseInt(a.dataset.leadId),i=a.value;try{await x(o,i),a.style.borderColor=i==="New"?"rgba(204,30,30,.4)":i==="Contacted"?"rgba(251,191,36,.4)":"rgba(34,197,94,.4)",a.style.color=i==="New"?"var(--red)":i==="Contacted"?"#fbbf24":"#22C55E"}catch(u){console.error("Status update failed:",u)}})})}async function M(){var i,u,f;const e=(i=document.getElementById("ml_name"))==null?void 0:i.value.trim(),t=(u=document.getElementById("ml_phone"))==null?void 0:u.value.trim(),n=document.getElementById("ml_car"),r=(f=document.getElementById("ml_notes"))==null?void 0:f.value.trim();if(!e&&!t){m("Enter customer name or phone","error");return}const d=n==null?void 0:n.options[n.selectedIndex],c=n!=null&&n.value?parseInt(n.value):null,a=(d==null?void 0:d.dataset.brand)||"General",s=(d==null?void 0:d.dataset.model)||"Enquiry",o=parseFloat(d==null?void 0:d.dataset.price)||0;try{await Z({car_id:c,brand:a,model:s,price:o,customer_name:e,customer_phone:t,notes:r}),m("✅ Lead added","success"),["ml_name","ml_phone","ml_notes"].forEach(O=>{const C=document.getElementById(O);C&&(C.value="")}),v()}catch{m("❌ Failed to add lead","error")}}function ce(){const e=l.invoiceList;if(e){if(!$.length){e.innerHTML='<p class="tbl-empty" style="display:block">No invoices yet.</p>';return}e.innerHTML=`<table class="adm-table">
    <thead><tr><th>Sr No</th><th>Date</th><th>Vehicle</th><th>Purchaser</th><th>Amount</th><th>Action</th></tr></thead>
    <tbody>${$.map(t=>`<tr>
      <td style="color:var(--red);font-weight:700">${t.sr_no}</td>
      <td class="t-sub">${F(t.sale_date||t.created_at)}</td>
      <td class="t-sub">${t.model_name||t.reg_no||"—"}</td>
      <td><div class="t-name">${t.purchaser_name}</div><div class="t-sub">${t.purchaser_mobile}</div></td>
      <td class="t-price" style="font-size:1rem">₹${ue(t.total_amount)}</td>
     <td>
      <a class="t-btn t-edit" href="invoice.html?view=${t.id}">View</a>

      <button class="t-btn broker-btn" data-broker='${JSON.stringify({brokerage:t.brokerage,broker:t.broker_name,notes:t.admin_notes})}'>
        💰
      </button>
    </td>
    </tr>`).join("")}</tbody>
  </table>`}}function ue(e){return(Number(e)||0).toLocaleString("en-IN",{maximumFractionDigits:0})}function F(e){return e?new Date(e).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—"}const B=document.querySelectorAll(".adm-tab-btn"),me=document.querySelectorAll(".adm-tab-pane");B.forEach(e=>{e.addEventListener("click",()=>{B.forEach(n=>n.classList.remove("active")),me.forEach(n=>n.classList.remove("active")),e.classList.add("active");const t=e.getAttribute("data-tab");document.getElementById(`tab-${t}`).classList.add("active")})});function be(e){document.getElementById("bm_amount").textContent=e.brokerage||"0",document.getElementById("bm_name").textContent=e.broker||"—",document.getElementById("bm_notes").textContent=e.notes||"—",document.getElementById("brokerModal").style.display="flex"}
