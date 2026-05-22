import{b as $,s as u,c as N,d as ne,u as se,e as oe,g as le}from"./toast-ofNrhuTp.js";/* empty css              */import{f as W}from"./invoiceService-CdsVTMRA.js";import{C as re,f as ie,b as de,c as ce,u as ue,d as pe}from"./config-CDgV_J-U.js";function me(e){return(typeof e=="string"?e:e.toISOString().slice(0,10)).slice(0,7)}function E(e){if(!e)return"—";const[t,a]=e.split("-");return`${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(a,10)-1]} ${t}`}async function fe({type:e,amount:t,date:a,note:s=null,staff:r=null,bill_no:o=null}){const n=me(a),l={type:e,amount:parseFloat(t),date:a,note:s||null,staff:r||null,bill_no:o||null,month_year:n},{data:i,error:d}=await $.from("expenses").insert([l]).select().single();if(d)throw console.error("[addExpense] error:",d),new Error(d.message||"Failed to save expense");return i}async function ye(e){const{error:t}=await $.from("expenses").delete().eq("id",e);if(t)throw console.error("[deleteExpense] error:",t),new Error(t.message||"Failed to delete expense")}async function X(e,t=null){let a=$.from("expenses").select("*").eq("type",e).order("date",{ascending:!1});t&&(a=a.eq("month_year",t));const{data:s,error:r}=await a;if(r)throw console.error("[fetchExpensesByType] error:",r),r;return s||[]}async function be(e,{amount:t,note:a,bill_no:s}){const r={};t!==void 0&&(r.amount=parseFloat(t)),a!==void 0&&(r.note=a||null),s!==void 0&&(r.bill_no=s||null);const{data:o,error:n}=await $.from("expenses").update(r).eq("id",e).select().single();if(n)throw console.error("[updateExpense] error:",n),new Error(n.message||"Failed to update expense");return o}async function ve(e=null){let t=$.from("expenses").select("type, amount");e&&(t=t.eq("month_year",e));const{data:a,error:s}=await t;if(s)throw console.error("[fetchExpenseSummary] error:",s),s;const r=a||[],o={rent:0,electricity:0,maintenance:0,salary:0,misc:0};let n=0;for(const l of r){const i=parseFloat(l.amount)||0;n+=i,o[l.type]!==void 0&&(o[l.type]+=i)}return{total:n,byCategory:o}}async function he(e,t=null){let a=$.from("expenses").select("*").eq("type",e).order("date",{ascending:!1});t&&(a=a.eq("month_year",t));const{data:s,error:r}=await a;if(r)throw console.error("[fetchGroupedByMonth] error:",r),r;const o=s||[],n={};for(const l of o){const i=l.month_year;n[i]||(n[i]={month_year:i,total:0,entries:[]}),n[i].entries.push(l),n[i].total+=parseFloat(l.amount)||0}return Object.values(n).sort((l,i)=>i.month_year.localeCompare(l.month_year))}async function ge(e=null){let t=$.from("expenses").select("*").eq("type","salary").order("date",{ascending:!1});e&&(t=t.eq("month_year",e));const{data:a,error:s}=await t;if(s)throw console.error("[fetchSalaryByStaff] error:",s),s;const r=a||[],o={};for(const n of r){const l=(n.staff||"Unknown").trim();o[l]||(o[l]={staff:l,total:0,entries:[]}),o[l].entries.push(n),o[l].total+=parseFloat(n.amount)||0}return Object.values(o).sort((n,l)=>n.staff.localeCompare(l.staff))}let y=[],L=[],$e=[],b=[],h=null,M=!1,c={};document.addEventListener("DOMContentLoaded",()=>{we(),xe(),Se(),Ce(),_e()});function we(){const e=t=>document.getElementById(t);c={gateOv:e("gateOv"),gateIn:e("gateIn"),gateErr:e("gateErr"),admContent:e("admContent"),logoutBtn:e("logoutBtn"),upZone:e("upZone"),imgIn:e("imgIn"),prevGrid:e("prevGrid"),upCnt:e("upCnt"),admTbody:e("admTbody"),invBadge:e("invBadge"),tblEmpty:e("tblEmpty"),tableSearch:e("tableSearch"),formTitle:e("formTitle"),formSubtitle:e("formSubtitle"),submitBtn:e("submitBtn"),cancelBtn:e("cancelBtn"),invoiceList:e("invoiceList"),dashStats:e("dashStats"),recentDeals:e("recentDeals"),leadsSection:e("leadsSection"),leadFilterCar:e("leadFilterCar")}}function xe(){const e=sessionStorage.getItem("role"),t=window.location.pathname;if(t.includes("admin")&&e==="owner"){J();return}t.includes("admin")&&e==="manager"&&(window.location.href="/manager"),c.gateOv.classList.remove("hidden"),c.gateIn.focus(),c.gateIn.addEventListener("keydown",a=>{a.key==="Enter"&&H()}),document.getElementById("gateBtn").addEventListener("click",H)}function J(){c.gateOv.classList.add("hidden"),c.admContent.style.display="block",c.logoutBtn.style.display="block",Ee()}function H(){c.gateIn.value.trim()===re.OWNER_PASSWORD?(sessionStorage.setItem("role","owner"),J()):(c.gateErr.classList.add("on"),c.gateIn.value="",c.gateIn.focus(),setTimeout(()=>c.gateErr.classList.remove("on"),3e3))}var V;(V=document.getElementById("logoutBtn"))==null||V.addEventListener("click",()=>{sessionStorage.removeItem("role"),window.location.href="/admin"});async function Ee(){u("⏳ Loading…","info");try{const[e,t]=await Promise.all([N(),W()]);y=e,L=t,A(),Te(),F(),await Promise.all([D(),I()]),u("✅ Loaded","success")}catch(e){console.error(e),u("❌ Load failed. Check Supabase credentials.","error")}}async function D(){try{const e=await N(),t=await W();Ne({totalCars:e.length,activeCars:e.length,soldCars:t.length,totalRev:t.reduce((a,s)=>a+(s.total_amount||0),0),monthRev:t.reduce((a,s)=>{const r=new Date(s.sale_date),o=new Date;return r.getMonth()===o.getMonth()&&r.getFullYear()===o.getFullYear()?a+(s.total_amount||0):a},0)})}catch{}}async function I(e=null){try{const[t,a,s]=await Promise.all([ie(),de(),ce(30)]);$e=s,De(t,a,e?s.filter(r=>r.car_id==e):s)}catch{}}function _e(){document.querySelectorAll(".adm-tab-btn").forEach(e=>e.addEventListener("click",()=>U(e.dataset.tab)))}function U(e){document.querySelectorAll(".adm-tab-btn").forEach(t=>t.classList.toggle("active",t.dataset.tab===e)),document.querySelectorAll(".adm-tab-pane").forEach(t=>t.classList.toggle("active",t.id===`tab-${e}`)),e==="leads"&&I()}function Se(){const e=c.upZone;e&&(e.addEventListener("dragover",t=>{t.preventDefault(),e.classList.add("drag")}),e.addEventListener("dragleave",t=>{e.contains(t.relatedTarget)||e.classList.remove("drag")}),e.addEventListener("drop",async t=>{t.preventDefault(),e.classList.remove("drag"),await G(Array.from(t.dataTransfer.files))}),c.imgIn.addEventListener("change",async t=>{await G(Array.from(t.target.files)),t.target.value=""}))}async function G(e){const t=e.filter(a=>a.type.startsWith("image/"));for(const a of t){const s=await ne(a),r=new FileReader;r.onload=o=>{b.push({file:s,src:o.target.result}),B()},r.readAsDataURL(s)}}function Le(e){b.splice(e,1),B()}function B(){const{prevGrid:e,upCnt:t}=c;if(e){if(!b.length){e.innerHTML="",t.style.display="none";return}e.innerHTML=b.map((a,s)=>`
    <div class="prev-slot"><img src="${a.src}"/>
    <button class="rm" data-rmidx="${s}">✕</button></div>`).join(""),t.style.display="block",t.textContent=`${b.length} photo${b.length!==1?"s":""} selected`}}function Ce(){var e,t,a,s,r,o,n;document.addEventListener("click",l=>{const i=l.target.closest("[data-broker]");if(!i)return;const d=JSON.parse(i.dataset.broker);Oe(d)}),(e=c.prevGrid)==null||e.addEventListener("click",l=>{const i=l.target.closest("[data-rmidx]");i&&Le(parseInt(i.dataset.rmidx))}),(t=c.admTbody)==null||t.addEventListener("click",l=>{const i=l.target.closest("[data-action]");if(!i)return;const d=parseInt(i.dataset.id);i.dataset.action==="edit"&&Be(d),i.dataset.action==="delete"&&Me(d),i.dataset.action==="invoice"&&(window.location.href=`invoice.html?car=${d}`)}),(a=c.tableSearch)==null||a.addEventListener("input",l=>A(l.target.value)),(s=c.submitBtn)==null||s.addEventListener("click",Ie),(r=c.cancelBtn)==null||r.addEventListener("click",Ae),(o=c.leadFilterCar)==null||o.addEventListener("change",l=>I(l.target.value||null)),(n=document.getElementById("addManualLeadBtn"))==null||n.addEventListener("click",Z)}function ke(){var a,s,r,o,n,l;const e=i=>{var d,p;return((p=(d=document.getElementById(i))==null?void 0:d.value)==null?void 0:p.trim())||""},t=i=>{var d;return parseFloat((d=document.getElementById(i))==null?void 0:d.value)||null};return{brand:e("a_brand"),model:e("a_model"),year:parseInt((a=document.getElementById("a_year"))==null?void 0:a.value)||null,price:parseFloat((s=document.getElementById("a_price"))==null?void 0:s.value)||null,km:e("a_km")||"N/A",fuel:((r=document.getElementById("a_fuel"))==null?void 0:r.value)||"Petrol",trans:((o=document.getElementById("a_trans"))==null?void 0:o.value)||"Automatic",color:e("a_color"),owner:((n=document.getElementById("a_owner"))==null?void 0:n.value)||"1st Owner",business_type:((l=document.getElementById("a_btype"))==null?void 0:l.value)||"owned",buy_price:t("a_buyprice"),brokerage:t("a_brokerage"),broker_name:e("a_broker")}}async function Ie(){if(M)return;const e=ke();if(!e.brand||!e.model||!e.year||!e.price){u("Fill Brand, Model, Year & Price","error");return}M=!0,c.submitBtn.disabled=!0,c.submitBtn.textContent="⏳ Saving…";try{const t=b.map(a=>a.file).filter(a=>a instanceof File);h!==null?(await se(h,{...e,images:b.map(a=>a.src)},t),u(`✅ ${e.brand} ${e.model} updated!`,"success")):(await oe(e,t),u(`✅ ${e.brand} ${e.model} added!`,"success")),y=await N(),A(),F(),D(),T()}catch(t){console.error(t),u("❌ Save failed","error")}finally{M=!1,c.submitBtn.disabled=!1,c.submitBtn.textContent=h?"✓ SAVE CHANGES":"+ ADD TO INVENTORY"}}function Be(e){var r;const t=y.find(o=>o.id===e);if(!t)return;h=e;const a=(o,n)=>{const l=document.getElementById(o);l&&(l.value=n||"")};a("a_brand",t.brand),a("a_model",t.model),a("a_year",t.year),a("a_price",t.price),a("a_km",t.km!=="N/A"?t.km:""),a("a_color",t.color),a("a_broker",t.broker_name),a("a_buyprice",t.buy_price||""),a("a_brokerage",t.brokerage||"");const s=(o,n)=>{const l=document.getElementById(o);l&&(l.value=n)};s("a_fuel",t.fuel),s("a_trans",t.trans),s("a_owner",t.owner),s("a_btype",t.business_type||"owned"),b=(t.images||[]).map((o,n)=>({src:o,name:`existing-${n}`,file:null})),B(),c.formTitle.textContent="EDIT CAR",c.formSubtitle.textContent=`Editing: ${t.brand} ${t.model}`,c.submitBtn.textContent="✓ SAVE CHANGES",c.cancelBtn.style.display="block",(r=document.querySelector(".adm-form-wrap"))==null||r.scrollIntoView({behavior:"smooth",block:"start"}),U("add")}function Ae(){h=null,T()}function T(){h=null,b=[],["a_brand","a_model","a_year","a_price","a_km","a_color","a_buyprice","a_brokerage","a_broker"].forEach(e=>{const t=document.getElementById(e);t&&(t.value="")}),[["a_fuel","Petrol"],["a_trans","Automatic"],["a_owner","1st Owner"],["a_btype","owned"]].forEach(([e,t])=>{const a=document.getElementById(e);a&&(a.value=t)}),B(),c.formTitle.textContent="ADD NEW CAR",c.formSubtitle.textContent="Fill details below",c.submitBtn.textContent="+ ADD TO INVENTORY",c.cancelBtn.style.display="none"}async function Me(e){const t=y.find(a=>a.id===e);if(!(!t||!confirm(`Remove ${t.brand} ${t.model}?`)))try{await le(e),y=y.filter(a=>a.id!==e),A(),F(),D(),h===e&&T(),u(`🗑 ${t.brand} ${t.model} removed`,"info")}catch{u("❌ Delete failed","error")}}function A(e=""){var n;const{admTbody:t,invBadge:a,tblEmpty:s}=c;if(!t)return;const r=(e||((n=c.tableSearch)==null?void 0:n.value)||"").toLowerCase(),o=y.filter(l=>!r||l.brand.toLowerCase().includes(r)||l.model.toLowerCase().includes(r)||String(l.year).includes(r));if(a.textContent=`${y.length} Cars`,!y.length){t.innerHTML="",s.style.display="block";return}s.style.display="none",t.innerHTML=o.map(l=>{var p,m;const i=l.business_type==="consignment"?'<span style="font-size:.6rem;background:rgba(251,191,36,.15);border:1px solid rgba(251,191,36,.4);color:#fbbf24;padding:2px 6px;margin-left:4px">CONSIGN</span>':"",d=L.some(v=>v.car_id===l.id);return`<tr class="${d?"row-sold":""}">
      <td><img class="t-thumb" src="${((p=l.images)==null?void 0:p[0])||""}" alt="${l.brand}"/></td>
      <td>
        <div class="t-name">${l.brand} ${l.model}${d?'<span class="t-sold-tag">SOLD</span>':""}${i}</div>
        <div class="t-sub">${l.year} · ${l.km}${l.color?" · "+l.color:""}</div>
        ${l.buy_price?`<div class="t-sub" style="color:#fbbf24">Buy: ₹${l.buy_price}L${l.broker_name?" · Broker: "+l.broker_name:""}</div>`:""}
      </td>
      <td class="t-price">₹${l.price}L</td>
      <td class="t-fuel-col">${l.fuel}<br><span class="t-trans">${l.trans}</span></td>
      <td><span class="p-badge">📷 ${((m=l.images)==null?void 0:m.length)||0}</span></td>
      <td><div class="t-acts">
      <button class="t-btn t-edit" data-action="edit" data-id="${l.id}">Edit</button>
      <button class="t-btn t-invoice" data-action="invoice" data-id="${l.id}">Invoice</button>
      <button class="t-btn t-del" data-action="delete" data-id="${l.id}">Delete</button>
      </div></td>
    </tr>`}).join("")}function Ne(e){const t=c.dashStats;t&&(t.innerHTML=`
    <div class="dash-stat"><span class="ds-num">${e.totalCars}</span><small>Total Cars</small></div>
    <div class="dash-stat"><span class="ds-num" style="color:#22C55E">${e.activeCars}</span><small>Available</small></div>
    <div class="dash-stat"><span class="ds-num" style="color:var(--red)">${e.soldCars}</span><small>Sold</small></div>
    <div class="dash-stat"><span class="ds-num">₹${Y(e.totalRev)}</span><small>Total Revenue</small></div>
    <div class="dash-stat"><span class="ds-num">₹${Y(e.monthRev)}</span><small>This Month</small></div>`)}function F(){const e=c.leadFilterCar;e&&(e.innerHTML='<option value="">All Cars</option>'+y.map(t=>`<option value="${t.id}">${t.brand} ${t.model} (${t.year})</option>`).join(""))}function De(e,t,a){var o;const s=c.leadsSection;if(!s)return;const r=n=>({whatsapp_card:"💬 WA Card",whatsapp_detail:"💬 WA Detail",whatsapp_banner:"💬 WA Banner",whatsapp_inquiry:"💬 WA Inquiry",call_card:"📞 Call Card",call_detail:"📞 Call Detail",manual:"✏️ Manual"})[n]||n;s.innerHTML=`
    <div class="leads-stats-row">
      <div class="lead-stat-card"><div class="lead-stat-num">${e}</div><div class="lead-stat-lbl">Total Leads</div></div>
      <div class="lead-stat-card"><div class="lead-stat-num">${a.filter(n=>n.source.includes("whatsapp")).length}</div><div class="lead-stat-lbl">WhatsApp</div></div>
      <div class="lead-stat-card"><div class="lead-stat-num">${a.filter(n=>n.source.includes("call")).length}</div><div class="lead-stat-lbl">Calls</div></div>
      <div class="lead-stat-card"><div class="lead-stat-num">${a.filter(n=>n.source==="manual").length}</div><div class="lead-stat-lbl">Manual</div></div>
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
            ${y.filter(n=>n.status==="available").map(n=>`<option value="${n.id}" data-brand="${n.brand}" data-model="${n.model}" data-price="${n.price}">${n.brand} ${n.model} (${n.year})</option>`).join("")}
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
          <tbody>${t.slice(0,10).map(n=>`<tr>
            <td><strong>${n.brand} ${n.model}</strong></td>
            <td style="color:rgba(255,255,255,.4)">₹${n.price}L</td>
            <td><div style="display:flex;align-items:center;gap:8px">
              <div style="width:${Math.min(n.count*14,140)}px;height:6px;background:var(--red);border-radius:3px"></div>
              <strong style="color:var(--red)">${n.count}</strong>
            </div></td>
          </tr>`).join("")}</tbody>
        </table>`:'<p class="tbl-empty" style="display:block">No leads yet.</p>'}
      </div>
      <div class="leads-panel">
        <h3 class="leads-panel-title">Recent Leads <small style="font-size:.6rem;color:rgba(255,255,255,.3);font-weight:400">— newest first</small></h3>
        ${a.length?`<table class="adm-table">
          <thead><tr><th>Time</th><th>Car</th><th>Customer</th><th>Source</th><th>Status</th></tr></thead>
          <tbody>${a.slice(0,30).map(n=>`<tr>
            <td style="font-size:.72rem;color:rgba(255,255,255,.4);white-space:nowrap">${K(n.created_at)}</td>
            <td><strong>${n.brand} ${n.model}</strong>${n.price?`<br><span style="color:rgba(255,255,255,.3);font-size:.68rem">₹${n.price}L</span>`:""}</td>
            <td style="font-size:.78rem">${n.customer_name||"—"}<br><span style="color:rgba(255,255,255,.35)">${n.customer_phone||""}</span></td>
            <td><span class="lead-source-badge lead-source-${n.source.split("_")[0]}">${r(n.source)}</span></td>
            <td>
              <select class="lead-status-sel" data-lead-id="${n.id}" style="background:#111;border:1px solid ${n.lead_status==="New"?"rgba(204,30,30,.4)":n.lead_status==="Contacted"?"rgba(251,191,36,.4)":"rgba(34,197,94,.4)"};color:${n.lead_status==="New"?"var(--red)":n.lead_status==="Contacted"?"#fbbf24":"#22C55E"};font-size:.65rem;padding:3px 6px;border-radius:2px">
                <option value="New" ${n.lead_status==="New"?"selected":""}>🔴 New</option>
                <option value="Contacted" ${n.lead_status==="Contacted"?"selected":""}>🟡 Contacted</option>
                <option value="Closed" ${n.lead_status==="Closed"?"selected":""}>🟢 Closed</option>
              </select>
            </td>
          </tr>`).join("")}</tbody>
        </table>`:'<p class="tbl-empty" style="display:block">No leads.</p>'}
      </div>
    </div>`,(o=document.getElementById("addManualLeadBtn"))==null||o.addEventListener("click",Z),s.querySelectorAll(".lead-status-sel").forEach(n=>{n.addEventListener("change",async l=>{const i=parseInt(n.dataset.leadId),d=n.value;try{await ue(i,d),n.style.borderColor=d==="New"?"rgba(204,30,30,.4)":d==="Contacted"?"rgba(251,191,36,.4)":"rgba(34,197,94,.4)",n.style.color=d==="New"?"var(--red)":d==="Contacted"?"#fbbf24":"#22C55E"}catch(p){console.error("Status update failed:",p)}})})}async function Z(){var d,p,m;const e=(d=document.getElementById("ml_name"))==null?void 0:d.value.trim(),t=(p=document.getElementById("ml_phone"))==null?void 0:p.value.trim(),a=document.getElementById("ml_car"),s=(m=document.getElementById("ml_notes"))==null?void 0:m.value.trim();if(!e&&!t){u("Enter customer name or phone","error");return}const r=a==null?void 0:a.options[a.selectedIndex],o=a!=null&&a.value?parseInt(a.value):null,n=(r==null?void 0:r.dataset.brand)||"General",l=(r==null?void 0:r.dataset.model)||"Enquiry",i=parseFloat(r==null?void 0:r.dataset.price)||0;try{await pe({car_id:o,brand:n,model:l,price:i,customer_name:e,customer_phone:t,notes:s}),u("✅ Lead added","success"),["ml_name","ml_phone","ml_notes"].forEach(v=>{const S=document.getElementById(v);S&&(S.value="")}),I()}catch{u("❌ Failed to add lead","error")}}function Te(){const e=c.invoiceList;if(!e)return;if(!L.length){e.innerHTML='<p class="tbl-empty" style="display:block">No invoices yet.</p>';return}const t=L.filter(o=>!o.invoice_type||o.invoice_type==="normal"),a=L.filter(o=>o.invoice_type==="park_sell"),s=o=>`<tr>
      <td style="color:var(--red);font-weight:700">${o.sr_no}</td>
      <td class="t-sub">${K(o.sale_date||o.created_at)}</td>
      <td class="t-sub">${o.model_name||o.reg_no||"—"}</td>
      <td><div class="t-name">${o.purchaser_name}</div><div class="t-sub">${o.purchaser_mobile}</div></td>
      <td class="t-price" style="font-size:1rem">₹${Fe(o.total_amount)}</td>
      <td>
        <a class="t-btn t-edit" href="invoice.html?view=${o.id}">View</a>
        <button class="t-btn broker-btn" data-broker='${JSON.stringify({brokerage:o.brokerage,broker:o.broker_name,notes:o.admin_notes})}'>💰</button>
      </td>
    </tr>`,r=o=>o.length?`<table class="adm-table">
        <thead><tr><th>Sr No</th><th>Date</th><th>Vehicle</th><th>Purchaser</th><th>Amount</th><th>Action</th></tr></thead>
        <tbody>${o.map(s).join("")}</tbody>
       </table>`:'<p class="tbl-empty" style="display:block">None yet.</p>';e.innerHTML=`
    <div class="inv-section-label">NORMAL INVOICES</div>
    ${r(t)}
    <div class="inv-section-label inv-section-label--park" style="margin-top:28px">PARK &amp; SELL INVOICES</div>
    ${r(a)}
  `}function Y(e){const t=Number(e)||0;return t>=1e5?(t/1e5).toFixed(2)+"L":t.toLocaleString("en-IN")}function Fe(e){return(Number(e)||0).toLocaleString("en-IN",{maximumFractionDigits:0})}function K(e){return e?new Date(e).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—"}const j=document.querySelectorAll(".adm-tab-btn"),qe=document.querySelectorAll(".adm-tab-pane");j.forEach(e=>{e.addEventListener("click",()=>{j.forEach(a=>a.classList.remove("active")),qe.forEach(a=>a.classList.remove("active")),e.classList.add("active");const t=e.getAttribute("data-tab");document.getElementById(`tab-${t}`).classList.add("active")})});function Oe(e){document.getElementById("bm_amount").textContent=e.brokerage||"0",document.getElementById("bm_name").textContent=e.broker||"—",document.getElementById("bm_notes").textContent=e.notes||"—",document.getElementById("brokerModal").style.display="flex"}let g="rent",f="";async function Re(){He(),Ye(),await k(),await _(g)}function He(){const e=document.getElementById("expGlobalMonth");if(!e)return;const t=Ge();e.innerHTML=t.map(({value:a,label:s})=>`<option value="${a}" ${a===f?"selected":""}>${s}</option>`).join(""),e.addEventListener("change",async()=>{f=e.value,await k(),await _(g)})}function Ge(){const e=new Date,t=[];for(let a=0;a<24;a++){const s=new Date(e.getFullYear(),e.getMonth()-a,1),r=s.getFullYear(),o=String(s.getMonth()+1).padStart(2,"0"),n=`${r}-${o}`;t.push({value:n,label:E(n)})}return t}function Ye(){document.querySelectorAll(".exp-pill").forEach(e=>{e.addEventListener("click",async()=>{document.querySelectorAll(".exp-pill").forEach(t=>t.classList.remove("active")),e.classList.add("active"),g=e.dataset.cat,await _(g)})})}async function k(){try{const{total:e,byCategory:t}=await ve(f||null),a=s=>"₹"+(s||0).toLocaleString("en-IN",{maximumFractionDigits:0});x("expSumTotal",a(e)),x("expSumRent",a(t.rent)),x("expSumElec",a(t.electricity)),x("expSumMaint",a(t.maintenance)),x("expSumSalary",a(t.salary)),x("expSumMisc",a(t.misc))}catch(e){console.error("[loadExpenseDashboard]",e)}}async function _(e){const t=document.getElementById("expCategoryPanel");if(t){t.innerHTML='<p class="tbl-empty" style="display:block">Loading…</p>';try{switch(e){case"rent":await Pe(t);break;case"electricity":await ze(t);break;case"maintenance":await P(t,"maintenance","Maintenance Entry");break;case"misc":await P(t,"misc","Misc Entry");break;case"salary":await We(t);break}}catch(a){console.error("[renderExpCategory]",a),t.innerHTML='<p class="tbl-empty" style="display:block">Failed to load. Check console.</p>'}}}function x(e,t){const a=document.getElementById(e);a&&(a.textContent=t)}function Q(e){return e?new Date(e+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—"}function C(e){return"₹"+(Number(e)||0).toLocaleString("en-IN",{maximumFractionDigits:0})}function w(){const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}`}async function je(e){if(confirm("Delete this expense entry?"))try{await ye(e),u("🗑 Entry deleted","info"),await k(),await _(g)}catch{u("❌ Delete failed","error")}}async function q(e){try{await fe(e),u("✅ Saved","success"),await k(),await _(g)}catch(t){u("❌ "+t.message,"error")}}async function Pe(e){const t=f||w(),a=await X("rent"),s=a.find(r=>r.month_year===t)||null;e.innerHTML=`
    ${ee("rent",t,s,["bill_no"],"Rent")}
    ${ae(a,!1)}
  `,te(e,"rent",t,s)}async function ze(e){const t=f||w(),a=await X("electricity"),s=a.find(r=>r.month_year===t)||null;e.innerHTML=`
    ${ee("electricity",t,s,["bill_no"],"Electricity Bill")}
    ${ae(a,!0)}
  `,te(e,"electricity",t,s)}function O(e,t){const[a,s]=(t||w()).split("-").map(Number),r=[["01","January"],["02","February"],["03","March"],["04","April"],["05","May"],["06","June"],["07","July"],["08","August"],["09","September"],["10","October"],["11","November"],["12","December"]],o=new Date,n=[];for(let d=o.getFullYear();d>=o.getFullYear()-3;d--)n.push(d);const l=r.map(([d,p])=>`<option value="${d}" ${Number(d)===s?"selected":""}>${p}</option>`).join(""),i=n.map(d=>`<option value="${d}" ${d===a?"selected":""}>${d}</option>`).join("");return`
    <div class="fg" style="display:flex;gap:8px;align-items:flex-end">
      <div style="flex:1"><label>Month *</label>
        <select class="fs" id="${e}Month">${l}</select>
      </div>
      <div style="flex:1"><label>Year *</label>
        <select class="fs" id="${e}Year">${i}</select>
      </div>
    </div>`}function R(e,t){var r,o;const a=(r=e.querySelector(`#${t}Month`))==null?void 0:r.value,s=(o=e.querySelector(`#${t}Year`))==null?void 0:o.value;return!a||!s?null:`${s}-${a}-01`}function ee(e,t,a,s=[],r=""){const o=!!a,n=o?`<div class="exp-notice">⚠️ Entry exists for ${E(t)}. Saving will update it.</div>`:"",l=s.includes("bill_no")?`<div class="fg"><label>Bill No. (optional)</label>
         <input class="fi" id="expBillNo" placeholder="e.g. EL-44" value="${(a==null?void 0:a.bill_no)||""}"/></div>`:"",i=o?"":O("expEntry",f||w());return`
  <div class="exp-form-panel">
    <h3>${r.toUpperCase()} — ${E(t)}</h3>
    ${n}
    <div class="exp-form-row">
      <div class="fg"><label>Amount (₹) *</label>
        <input class="fi" id="expAmount" type="number" placeholder="0" value="${(a==null?void 0:a.amount)||""}"/>
      </div>
      ${l}
      ${i}
      <div class="fg"><label>Note</label>
        <input class="fi" id="expNote" placeholder="Optional note" value="${(a==null?void 0:a.note)||""}"/>
      </div>
      <div class="exp-form-actions">
        <button class="add-btn" id="expSaveBtn" style="width:auto;padding:9px 20px;font-size:.72rem">
          ${o?"✓ UPDATE":"+ SAVE"}
        </button>
      </div>
    </div>
  </div>
  `}function te(e,t,a,s){var r;(r=e.querySelector("#expSaveBtn"))==null||r.addEventListener("click",async()=>{var i,d,p;const o=(i=e.querySelector("#expAmount"))==null?void 0:i.value,n=((d=e.querySelector("#expNote"))==null?void 0:d.value)||"",l=((p=e.querySelector("#expBillNo"))==null?void 0:p.value)||null;if(!o||parseFloat(o)<=0){u("Enter a valid amount","error");return}if(s)try{await be(s.id,{amount:o,note:n,bill_no:l}),u("✅ Updated","success"),await k(),await _(g)}catch(m){u("❌ "+m.message,"error")}else{const m=R(e,"expEntry");if(!m){u("Select month and year","error");return}await q({type:t,amount:o,date:m,note:n,bill_no:l})}})}function ae(e,t=!1){return e.length?`
    <div class="exp-history">
      <p class="exp-history-header">History</p>
      ${e.map(s=>`
    <div class="exp-month-row" data-id="${s.id}">
      <span class="exp-month-label">${E(s.month_year)}</span>
      <span class="exp-month-note">
        ${t&&s.bill_no?`<strong>${s.bill_no}</strong> — `:""}${s.note||""}
      </span>
      <span class="exp-month-amount">${C(s.amount)}</span>
      <div class="exp-row-actions">
        <button class="t-btn t-del" data-del-id="${s.id}">Delete</button>
      </div>
    </div>
  `).join("")}
    </div>
  `:'<div class="exp-history"><p class="exp-empty">No history yet.</p></div>'}async function P(e,t,a){var o;const r=await he(t,f||null);e.innerHTML=`
    <div class="exp-form-panel">
      <h3>${a.toUpperCase()}</h3>
      <div class="exp-form-row">
        ${O("expGrp",f||w())}
        <div class="fg"><label>Description *</label>
          <input class="fi" id="expDesc" placeholder="What was done / purchased"/>
        </div>
        <div class="fg"><label>Amount (₹) *</label>
          <input class="fi" id="expAmount" type="number" placeholder="0"/>
        </div>
        <div class="exp-form-actions">
          <button class="add-btn" id="expSaveBtn" style="width:auto;padding:9px 20px;font-size:.72rem">+ ADD</button>
        </div>
      </div>
    </div>
    <div class="exp-history" id="expGroupedHistory">
      ${Ve(r)}
    </div>
  `,(o=e.querySelector("#expSaveBtn"))==null||o.addEventListener("click",async()=>{var m,v,S;const n=R(e,"expGrp"),l=(v=(m=e.querySelector("#expDesc"))==null?void 0:m.value)==null?void 0:v.trim(),i=(S=e.querySelector("#expAmount"))==null?void 0:S.value;if(!n){u("Select month and year","error");return}if(!l){u("Description is required","error");return}if(!i||parseFloat(i)<=0){u("Enter a valid amount","error");return}await q({type:t,amount:i,date:n,note:l});const d=e.querySelector("#expDesc"),p=e.querySelector("#expAmount");d&&(d.value=""),p&&(p.value="")})}function Ve(e){return e.length?e.map(t=>`
    <div class="exp-group-block">
      <div class="exp-group-head">
        <span class="exp-group-month">${E(t.month_year)}</span>
        <span class="exp-group-total">Total: ${C(t.total)}</span>
      </div>
      ${t.entries.map(a=>`
        <div class="exp-entry-row">
          <span class="exp-entry-date">${Q(a.date)}</span>
          <span class="exp-entry-desc">${a.note||"—"}</span>
          <span class="exp-entry-amount">${C(a.amount)}</span>
          <button class="t-btn t-del" data-del-id="${a.id}" style="flex-shrink:0">Delete</button>
        </div>
      `).join("")}
    </div>
  `).join(""):'<p class="exp-empty">No entries yet.</p>'}async function We(e){var s;const t=f||null,a=await ge(t);e.innerHTML=`
    <div class="exp-form-panel">
      <h3>SALARY PAYMENT</h3>
      <div class="exp-form-row">
        <div class="fg"><label>Staff Name *</label>
          <input class="fi" id="expStaff" placeholder="Full name" list="staffNameList"/>
          <datalist id="staffNameList">
            ${a.map(r=>`<option value="${r.staff}">`).join("")}
          </datalist>
        </div>
        <div class="fg"><label>Amount (₹) *</label>
          <input class="fi" id="expAmount" type="number" placeholder="0"/>
        </div>
        ${O("expSal",f||w())}
        <div class="fg"><label>Note (optional)</label>
          <input class="fi" id="expNote" placeholder="e.g. April salary"/>
        </div>
        <div class="exp-form-actions">
          <button class="add-btn" id="expSaveBtn" style="width:auto;padding:9px 20px;font-size:.72rem">+ ADD</button>
        </div>
      </div>
    </div>
    ${t?`<p class="exp-notice" style="margin-bottom:14px">📅 Showing: ${E(t)}</p>`:""}
    <div class="exp-history" id="expSalaryHistory">
      ${Xe(a)}
    </div>
  `,(s=e.querySelector("#expSaveBtn"))==null||s.addEventListener("click",async()=>{var i,d,p,m,v;const r=(d=(i=e.querySelector("#expStaff"))==null?void 0:i.value)==null?void 0:d.trim(),o=(p=e.querySelector("#expAmount"))==null?void 0:p.value,n=R(e,"expSal"),l=((v=(m=e.querySelector("#expNote"))==null?void 0:m.value)==null?void 0:v.trim())||null;if(!r){u("Enter staff name","error");return}if(!o||parseFloat(o)<=0){u("Enter a valid amount","error");return}if(!n){u("Select month and year","error");return}await q({type:"salary",amount:o,date:n,note:l,staff:r})})}function Xe(e){return e.length?e.map(t=>`
    <div class="exp-staff-card">
      <div class="exp-staff-head">
        <span class="exp-staff-name">${t.staff}</span>
        <span class="exp-staff-total">${C(t.total)}</span>
      </div>
      ${t.entries.map(a=>`
        <div class="exp-entry-row">
          <span class="exp-entry-date">${Q(a.date)}</span>
          <span class="exp-entry-desc">${a.note||"Salary payment"}</span>
          <span class="exp-entry-amount">${C(a.amount)}</span>
          <button class="t-btn t-del" data-del-id="${a.id}" style="flex-shrink:0">Delete</button>
        </div>
      `).join("")}
    </div>
  `).join(""):'<p class="exp-empty">No salary records yet.</p>'}document.addEventListener("click",async e=>{const t=e.target.closest("[data-del-id]");t&&t.closest("#expCategoryPanel")&&await je(parseInt(t.dataset.delId))});let z=!1;document.addEventListener("click",async e=>{const t=e.target.closest(".adm-tab-btn");!t||t.dataset.tab!=="expenses"||z||(z=!0,f=w(),setTimeout(()=>{const a=document.getElementById("expGlobalMonth");a&&(a.value=f)},0),await Re())});
