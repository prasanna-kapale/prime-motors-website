import{f as m,a as I,s as C}from"./toast-ofNrhuTp.js";import{g as v,a as p,w as r,t as f}from"./config-CDgV_J-U.js";const k='<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',S='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';function h(e){var d,n,c;if(e.status==="sold")return`
    <div class="car-card car-card--sold">
      <div class="crd-img-wrap">
        <img class="crd-img" src="${((d=e.images)==null?void 0:d[0])||""}" alt="${e.brand} ${e.model}" loading="lazy"/>
        <div class="crd-fuel">${e.fuel}</div>
        <div class="crd-sold-badge">SOLD</div>
      </div>
      <div class="crd-body">
        <div class="crd-brand">${e.brand}</div>
        <div class="crd-name">${e.model}</div>
        <div class="crd-bottom"><div class="crd-price">₹${e.price}L</div><div class="crd-arr">—</div></div>
      </div>
    </div>`;const t=JSON.stringify({id:e.id,brand:e.brand,model:e.model,price:e.price}),a=v(e);return`
    <div class="car-card" data-carid="${e.id}" onclick="window.openDetail(${e.id})">
      <div class="crd-img-wrap">
        <img class="crd-img" src="${((n=e.images)==null?void 0:n[0])||""}" alt="${e.brand} ${e.model}" loading="lazy"/>
        <div class="crd-fuel">${e.fuel}</div>
        <div class="crd-photos">📷 ${((c=e.images)==null?void 0:c.length)||0}</div>
      </div>
      <div class="crd-body">
        <div class="crd-brand">${e.brand}</div>
        <div class="crd-name">${e.model}</div>
        <div class="crd-specs">
          <span class="crd-spec">${e.year}</span>
          <span class="crd-spec">${e.km}</span>
          <span class="crd-spec">${e.trans}</span>
          ${e.owner?`<span class="crd-spec">${e.owner}</span>`:""}
        </div>
        <div class="crd-price-row">
          <div class="crd-price">₹${e.price}L</div>
        </div>
        <div class="crd-actions" onclick="event.stopPropagation()">
          <a class="crd-btn crd-btn-wa"
            href="${a}"
            target="_blank"
            onclick="handleWhatsAppClick(event, '${e.id}', '${e.brand}', '${e.model}', '${e.price}')">
            ${k} WhatsApp
          </a>
          <a class="crd-btn crd-btn-call"
             href="${p()}"
             data-lead='${t}' data-source="call_card">
            ${S} Call
          </a>
        </div>
      </div>
    </div>`}function o(e="No cars available."){return`<div class="grid-empty">${e}</div>`}function b(e){e.addEventListener("click",async t=>{const a=t.target.closest("[data-source]");if(a)try{const d=JSON.parse(a.dataset.lead),n=a.dataset.source;if(n.includes("whatsapp")){const c=a.dataset.waUrl||a.href||"";t.preventDefault(),await r(d,c)}else f(d,n)}catch(d){console.warn("[bindLeadTracking] error:",d)}})}const A='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',M='<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>';let l=null,u=0;function x(e){l=e,u=0}function T(e){return`
    <div class="gal-main">
      <img class="gal-img" id="mainImg" src="${e.images[0]}" alt="${e.brand} ${e.model}"/>
      <button class="gal-arr prev" id="galPrev">&#8249;</button>
      <button class="gal-arr next" id="galNext">&#8250;</button>
      <div class="gal-ctr" id="galCtr">1 / ${e.images.length}</div>
    </div>
    <div class="gal-thumbs">
      ${e.images.map((t,a)=>`
        <div class="gal-thumb ${a===0?"active":""}" data-idx="${a}">
          <img src="${t}" alt="Photo ${a+1}" loading="lazy"/>
        </div>`).join("")}
    </div>`}function N(e){const t=JSON.stringify({id:e.id,brand:e.brand,model:e.model,price:e.price}),a=v(e);return`
    <div class="detail-cta-row">
      <button class="d-wa"
         data-lead='${t}' data-source="whatsapp_detail" data-wa-url="${a}">
        ${A} Enquire on WhatsApp
      </button>
      <a class="d-call" href="${p()}"
         data-lead='${t}' data-source="call_detail">
        ${M} Call Now
      </a>
    </div>`}function O(){var e,t;(e=document.getElementById("galPrev"))==null||e.addEventListener("click",()=>g(-1)),(t=document.getElementById("galNext"))==null||t.addEventListener("click",()=>g(1)),document.querySelectorAll(".gal-thumb").forEach(a=>a.addEventListener("click",()=>w(parseInt(a.dataset.idx))))}function q(){var e;(e=document.querySelector(".detail-cta-row"))==null||e.addEventListener("click",async t=>{const a=t.target.closest("[data-source]");if(a)try{const d=JSON.parse(a.dataset.lead),n=a.dataset.source;n.includes("whatsapp")?(t.preventDefault(),await r(d,a.dataset.waUrl||"")):f(d,n)}catch(d){console.warn("[bindDetailLeads]",d)}})}function w(e){if(!l)return;u=e;const t=document.getElementById("mainImg"),a=document.getElementById("galCtr");t.classList.add("fading"),setTimeout(()=>{t.src=l.images[e],t.classList.remove("fading"),a&&(a.textContent=`${e+1} / ${l.images.length}`)},200),document.querySelectorAll(".gal-thumb").forEach((d,n)=>d.classList.toggle("active",n===e))}function g(e){l&&w((u+e+l.images.length)%l.images.length)}let i=[],y=0,s=!1;document.addEventListener("DOMContentLoaded",async()=>{H(),P(),J();try{[i]=await Promise.all([m(),_()]),E()}catch(e){console.error(e),D("Failed to load inventory.")}z()});async function _(){try{const e=await I(),t=document.getElementById("heroCarCount");t&&(t.textContent=e)}catch{}}function D(e){["featuredGrid","invGrid"].forEach(t=>{const a=document.getElementById(t);a&&(a.innerHTML=o(e))})}function $(e){var t;document.querySelectorAll(".page").forEach(a=>a.classList.remove("active")),document.querySelectorAll(".nav-links a").forEach(a=>a.classList.remove("active")),document.getElementById("page-"+e).classList.add("active"),(t=document.getElementById("nl-"+e))==null||t.classList.add("active"),window.scrollTo({top:0,behavior:"instant"}),e==="inventory"&&m().then(a=>{i=a,B(i)}).catch(()=>{}),e==="home"&&E()}window.nav=$;function G(){var e,t,a;s=!s,(e=document.getElementById("mobileNav"))==null||e.classList.toggle("open",s),(t=document.getElementById("mobBackdrop"))==null||t.classList.toggle("on",s),(a=document.getElementById("hamburger"))==null||a.classList.toggle("open",s),document.body.style.overflow=s?"hidden":""}function F(){var e,t,a;s=!1,(e=document.getElementById("mobileNav"))==null||e.classList.remove("open"),(t=document.getElementById("mobBackdrop"))==null||t.classList.remove("on"),(a=document.getElementById("hamburger"))==null||a.classList.remove("open"),document.body.style.overflow=""}window.toggleMenu=G;window.closeMenu=F;function H(){window.addEventListener("scroll",()=>{var e;return(e=document.getElementById("navbar"))==null?void 0:e.classList.toggle("scrolled",window.scrollY>50)})}function P(){setInterval(()=>L((y+1)%4),5e3)}function L(e){document.querySelectorAll(".hero-slide").forEach((t,a)=>t.classList.toggle("active",a===e)),document.querySelectorAll(".h-dot").forEach((t,a)=>t.classList.toggle("active",a===e)),y=e}window.setSlide=L;function E(){const e=document.getElementById("featuredGrid");e&&(e.innerHTML=i.length?i.slice(0,6).map(t=>h(t)).join(""):o("No cars available."),b(e))}function B(e){const t=document.getElementById("invGrid"),a=document.getElementById("rCnt");t&&(t.innerHTML=e.length?e.map(d=>h(d)).join(""):o("No cars match filters."),b(t)),a&&(a.textContent=e.length)}function U(){const e=document.getElementById("fBrand").value,t=document.getElementById("fFuel").value,a=document.getElementById("fBudget").value;let d=i;e&&(d=d.filter(n=>n.brand===e)),t&&(d=d.filter(n=>n.fuel===t)),a&&(d=d.filter(n=>n.price<parseInt(a))),B(d)}window.applyFilters=U;async function W(e){const t=i.find(a=>a.id===e);if(!t){C("Car not found","error");return}x(t),document.getElementById("detailBody").innerHTML=`
    <div>${T(t)}</div>
    <div class="detail-info">
      <div class="d-badges">
        <span class="d-badge d-badge-red">Certified Pre-Owned</span>
        <span class="d-badge d-badge-gr">${t.fuel}</span>
        <span class="d-badge d-badge-gr">${t.trans}</span>
        ${t.owner?`<span class="d-badge d-badge-gr">${t.owner}</span>`:""}
      </div>
      <h1 class="d-title">${t.brand} ${t.model}</h1>
      <p class="d-sub">${t.year} &nbsp;·&nbsp; ${t.km}</p>
      <div class="d-price">₹${t.price}L</div>
      <p class="d-pnote">All-inclusive · EMI available · No hidden charges</p>
      <table class="specs-tbl">
        <tr><td>Brand</td><td>${t.brand}</td></tr>
        <tr><td>Model</td><td>${t.model}</td></tr>
        <tr><td>Year</td><td>${t.year}</td></tr>
        <tr><td>Odometer</td><td>${t.km}</td></tr>
        <tr><td>Fuel</td><td>${t.fuel}</td></tr>
        <tr><td>Transmission</td><td>${t.trans}</td></tr>
        ${t.color?`<tr><td>Color</td><td>${t.color}</td></tr>`:""}
        ${t.owner?`<tr><td>Owner</td><td>${t.owner}</td></tr>`:""}
      </table>
      ${N(t)}
    </div>`,O(),q(),$("detail")}window.openDetail=W;function z(){var e;(e=document.getElementById("bannerWaBtn"))==null||e.addEventListener("click",async t=>{const a=t.currentTarget.href||"";t.preventDefault(),await r({id:null,brand:"General",model:"Enquiry",price:0},a)})}function J(){const e=new IntersectionObserver(t=>{t.forEach(a=>{a.isIntersecting&&(a.target.classList.add("visible"),e.unobserve(a.target))})},{threshold:.12,rootMargin:"0px 0px -40px 0px"});document.querySelectorAll(".fade-in").forEach(t=>e.observe(t))}window.handleWhatsAppClick=function(e,t,a,d,n){e.stopPropagation();try{fetch("/track-lead",{method:"POST",body:JSON.stringify({id:t,brand:a,model:d,price:n,source:"whatsapp_card"}),headers:{"Content-Type":"application/json"}})}catch{console.warn("Lead tracking failed")}};
