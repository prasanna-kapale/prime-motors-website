// =====================================================
// PRIME MOTORS — src/admin.js
// Admin: inventory CRUD, leads, invoices, dashboard
// Business-type fields only visible here
// =====================================================
import './styles/style.css'
import './styles/admin.css'
import { fetchCars, createCar, updateCar, deleteCar } from './services/inventory.js'
import { fetchInvoices, fetchDashboardStats }           from './services/invoiceService.js'
import { fetchRecentLeads, fetchLeadsPerCar, fetchLeadCount,
         createManualLead, fetchLeads, updateLeadStatus } from './services/leads.js'
import { showToast }                                    from './components/toast.js'
import { CONFIG }                                       from './config.js'
import { compressImage }                                from './components/imageCompressor.js'
import { USE_SUPABASE }                                 from './services/supabase.js'
import {
  addExpense, deleteExpense, updateExpense, checkDuplicate,
  fetchExpensesByType, fetchExpenseSummary,
  fetchGroupedByMonth, fetchSalaryByStaff,
  fetchExpenseMonths, toMonthYear, fmtMonthYear,
} from './services/expenseService.js'

let adminCars = [], invoices = [], allLeads = [], uploadedImgs = []
let editingId = null, isSubmitting = false, refs = {}

document.addEventListener('DOMContentLoaded', () => {
  if (!USE_SUPABASE) { alert('⚠️ Configure .env with Supabase credentials. See SETUP.md'); return }
  cacheRefs(); setupGate(); setupUploadZone(); setupDelegation(); setupTabs()
})

function cacheRefs() {
  const g = id => document.getElementById(id)
  refs = {
    gateOv: g('gateOv'), gateIn: g('gateIn'), gateErr: g('gateErr'),
    admContent: g('admContent'), logoutBtn: g('logoutBtn'),
    upZone: g('upZone'), imgIn: g('imgIn'), prevGrid: g('prevGrid'), upCnt: g('upCnt'),
    admTbody: g('admTbody'), invBadge: g('invBadge'), tblEmpty: g('tblEmpty'),
    tableSearch: g('tableSearch'), formTitle: g('formTitle'), formSubtitle: g('formSubtitle'),
    submitBtn: g('submitBtn'), cancelBtn: g('cancelBtn'),
    invoiceList: g('invoiceList'), dashStats: g('dashStats'),
    recentDeals: g('recentDeals'), leadsSection: g('leadsSection'),
    leadFilterCar: g('leadFilterCar'),
  }
}

// ── AUTH ──────────────────────────────────────────────
function setupGate() {
  const role = sessionStorage.getItem("role")
  const path = window.location.pathname

  if (path.includes("admin")) {
    if (role === "owner") {
      unlockPanel()
      return
    }
  }

  // 🚫 block manager from admin
  if (path.includes("admin") && role === "manager") {
    window.location.href = "/manager"
  }

  refs.gateOv.classList.remove('hidden')
  refs.gateIn.focus()

  refs.gateIn.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkPwd()
  })

  document.getElementById('gateBtn').addEventListener('click', checkPwd)
}
function unlockPanel() {
  refs.gateOv.classList.add("hidden")
  refs.admContent.style.display = "block"
  refs.logoutBtn.style.display = "block"

  loadAll()
}
function checkPwd() {
  const pwd = refs.gateIn.value.trim()

  if (pwd === CONFIG.OWNER_PASSWORD) {
    sessionStorage.setItem("role", "owner")
    unlockPanel()
  } else {
    refs.gateErr.classList.add('on')
    refs.gateIn.value = ''
    refs.gateIn.focus()
    setTimeout(() => refs.gateErr.classList.remove('on'), 3000)
  }
}
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  sessionStorage.removeItem("role") // ✅ CLEAR SESSION
  window.location.href = '/admin'
})
// ── LOAD ALL ──────────────────────────────────────────
async function loadAll() {
  showToast('⏳ Loading…','info')
  try {
    const [cars, invs] = await Promise.all([fetchCars(), fetchInvoices()])
    adminCars = cars; invoices = invs
    renderTable(); renderInvoiceList(); renderCarFilter()
    await Promise.all([loadDashboard(), loadLeads()])
    showToast('✅ Loaded','success')
  } catch(e) { console.error(e); showToast('❌ Load failed. Check Supabase credentials.','error') }
}
async function loadDashboard() {
  try {
    const cars = await fetchCars()
    const invoices = await fetchInvoices()

    renderDashStats({
      totalCars: cars.length,
      activeCars: cars.length,
      soldCars: invoices.length,
      totalRev: invoices.reduce((s, i) => s + (i.total_amount || 0), 0),
      monthRev: invoices.reduce((s, i) => {
        const d = new Date(i.sale_date)
        const now = new Date()
        return (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear())
          ? s + (i.total_amount || 0)
          : s
      }, 0)
    })
  } catch {}
}
async function loadLeads(carId = null) {
  try {
    const [cnt, perCar, recent] = await Promise.all([
      fetchLeadCount(), fetchLeadsPerCar(), fetchRecentLeads(30)
    ])
    allLeads = recent
    renderLeads(cnt, perCar, carId ? recent.filter(l => l.car_id == carId) : recent)
  } catch {}
}

// ── TABS ──────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.adm-tab-btn').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab)))
}
function switchTab(tab) {
  document.querySelectorAll('.adm-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab===tab))
  document.querySelectorAll('.adm-tab-pane').forEach(p => p.classList.toggle('active', p.id===`tab-${tab}`))
  if (tab==='leads') loadLeads()
}

// ── UPLOAD ────────────────────────────────────────────
function setupUploadZone() {
  const z = refs.upZone; if (!z) return
  z.addEventListener('dragover',  e => { e.preventDefault(); z.classList.add('drag') })
  z.addEventListener('dragleave', e => { if (!z.contains(e.relatedTarget)) z.classList.remove('drag') })
  z.addEventListener('drop', async e => { e.preventDefault(); z.classList.remove('drag'); await addFiles(Array.from(e.dataTransfer.files)) })
  refs.imgIn.addEventListener('change', async e => { await addFiles(Array.from(e.target.files)); e.target.value = '' })
}
async function addFiles(files) {
  const imageFiles = files.filter(f => f.type.startsWith('image/'))
  for (const file of imageFiles) {
    const compressed = await compressImage(file)
    const r = new FileReader()
    r.onload = ev => { uploadedImgs.push({ file: compressed, src: ev.target.result }); renderPreviews() }
    r.readAsDataURL(compressed)
  }
}
function removeImg(i) { uploadedImgs.splice(i,1); renderPreviews() }
function renderPreviews() {
  const { prevGrid, upCnt } = refs
  if (!prevGrid) return
  if (!uploadedImgs.length) { prevGrid.innerHTML = ''; upCnt.style.display='none'; return }
  prevGrid.innerHTML = uploadedImgs.map((img,i) => `
    <div class="prev-slot"><img src="${img.src}"/>
    <button class="rm" data-rmidx="${i}">✕</button></div>`).join('')
  upCnt.style.display = 'block'
  upCnt.textContent = `${uploadedImgs.length} photo${uploadedImgs.length!==1?'s':''} selected`
}

// ── EVENT DELEGATION ──────────────────────────────────
function setupDelegation() {
  document.addEventListener('click', e => {
  const btn = e.target.closest('[data-broker]')
  if (!btn) return

  const data = JSON.parse(btn.dataset.broker)

  showBrokerageModal(data)
})
  refs.prevGrid?.addEventListener('click', e => {
    const b = e.target.closest('[data-rmidx]'); if (b) removeImg(parseInt(b.dataset.rmidx))
  })
  refs.admTbody?.addEventListener('click', e => {
    const b = e.target.closest('[data-action]'); if (!b) return
    const id = parseInt(b.dataset.id)
    if (b.dataset.action==='edit')    editCar(id)
    if (b.dataset.action==='delete')  handleDelete(id)
    if (b.dataset.action==='invoice') window.location.href = `invoice.html?car=${id}`
  })
  refs.tableSearch?.addEventListener('input', e => renderTable(e.target.value))
  refs.submitBtn?.addEventListener('click', handleSubmit)
  refs.cancelBtn?.addEventListener('click', cancelEdit)
  refs.leadFilterCar?.addEventListener('change', e => loadLeads(e.target.value||null))
  // Manual lead form
  document.getElementById('addManualLeadBtn')?.addEventListener('click', handleManualLead)
}

// ── FORM VALUES ───────────────────────────────────────
function getFormVals() {
  const g = id => document.getElementById(id)?.value?.trim() || ''
  const n = id => parseFloat(document.getElementById(id)?.value) || null
  return {
    brand: g('a_brand'), model: g('a_model'),
    year: parseInt(document.getElementById('a_year')?.value) || null,
    price: parseFloat(document.getElementById('a_price')?.value) || null,
    km: g('a_km') || 'N/A', fuel: document.getElementById('a_fuel')?.value || 'Petrol',
    trans: document.getElementById('a_trans')?.value || 'Automatic',
    color: g('a_color'), owner: document.getElementById('a_owner')?.value || '1st Owner',
    // Admin-only
    business_type: document.getElementById('a_btype')?.value || 'owned',
    buy_price: n('a_buyprice'), brokerage: n('a_brokerage'), broker_name: g('a_broker'),
  }
}

// ── ADD / EDIT ─────────────────────────────────────────
async function handleSubmit() {
  if (isSubmitting) return
  const d = getFormVals()
  if (!d.brand||!d.model||!d.year||!d.price) { showToast('Fill Brand, Model, Year & Price','error'); return }
  isSubmitting = true; refs.submitBtn.disabled = true; refs.submitBtn.textContent = '⏳ Saving…'
  try {
    const rawFiles = uploadedImgs.map(i => i.file).filter(f => f instanceof File)
    if (editingId !== null) {
      await updateCar(editingId, { ...d, images: uploadedImgs.map(i => i.src) }, rawFiles)
      showToast(`✅ ${d.brand} ${d.model} updated!`,'success')
    } else {
      await createCar(d, rawFiles)
      showToast(`✅ ${d.brand} ${d.model} added!`,'success')
    }
    adminCars = await fetchCars(); renderTable(); renderCarFilter(); loadDashboard(); resetForm()
  } catch(e) { console.error(e); showToast('❌ Save failed','error') }
  finally { isSubmitting=false; refs.submitBtn.disabled=false
    refs.submitBtn.textContent = editingId?'✓ SAVE CHANGES':'+ ADD TO INVENTORY' }
}

function editCar(id) {
  const c = adminCars.find(x => x.id===id); if (!c) return
  editingId = id
  const sv = (eid,v) => { const el=document.getElementById(eid); if (el) el.value=v||'' }
  sv('a_brand',c.brand); sv('a_model',c.model); sv('a_year',c.year); sv('a_price',c.price)
  sv('a_km', c.km!=='N/A'?c.km:''); sv('a_color',c.color); sv('a_broker',c.broker_name)
  sv('a_buyprice',c.buy_price||''); sv('a_brokerage',c.brokerage||'')
  const sf = (eid,v) => { const el=document.getElementById(eid); if (el) el.value=v }
  sf('a_fuel',c.fuel); sf('a_trans',c.trans); sf('a_owner',c.owner); sf('a_btype',c.business_type||'owned')
  uploadedImgs = (c.images||[]).map((src,i) => ({ src, name:`existing-${i}`, file:null }))
  renderPreviews()
  refs.formTitle.textContent='EDIT CAR'; refs.formSubtitle.textContent=`Editing: ${c.brand} ${c.model}`
  refs.submitBtn.textContent='✓ SAVE CHANGES'; refs.cancelBtn.style.display='block'
  document.querySelector('.adm-form-wrap')?.scrollIntoView({ behavior:'smooth', block:'start' })
  switchTab('add')
}
function cancelEdit() { editingId=null; resetForm() }
function resetForm() {
  editingId=null; uploadedImgs=[]
  ;['a_brand','a_model','a_year','a_price','a_km','a_color','a_buyprice','a_brokerage','a_broker'].forEach(id => {
    const el=document.getElementById(id); if (el) el.value=''
  })
  ;[['a_fuel','Petrol'],['a_trans','Automatic'],['a_owner','1st Owner'],['a_btype','owned']].forEach(([id,v]) => {
    const el=document.getElementById(id); if (el) el.value=v
  })
  renderPreviews()
  refs.formTitle.textContent='ADD NEW CAR'; refs.formSubtitle.textContent='Fill details below'
  refs.submitBtn.textContent='+ ADD TO INVENTORY'; refs.cancelBtn.style.display='none'
}

// ── DELETE ────────────────────────────────────────────
async function handleDelete(id) {
  const c = adminCars.find(x => x.id===id)
  if (!c||!confirm(`Remove ${c.brand} ${c.model}?`)) return
  try {
    await deleteCar(id)
    adminCars = adminCars.filter(x => x.id!==id)
    renderTable(); renderCarFilter(); loadDashboard()
    if (editingId===id) resetForm()
    showToast(`🗑 ${c.brand} ${c.model} removed`,'info')
  } catch { showToast('❌ Delete failed','error') }
}

// ── RENDER TABLE ──────────────────────────────────────
function renderTable(q='') {
  const { admTbody, invBadge, tblEmpty } = refs
  if (!admTbody) return
  const query = (q||refs.tableSearch?.value||'').toLowerCase()
  const vis = adminCars.filter(c => !query ||
    c.brand.toLowerCase().includes(query) || c.model.toLowerCase().includes(query) || String(c.year).includes(query))
  invBadge.textContent = `${adminCars.length} Cars`
  if (!adminCars.length) { admTbody.innerHTML=''; tblEmpty.style.display='block'; return }
  tblEmpty.style.display='none'
  admTbody.innerHTML = vis.map(c => {
    const btypeTag = c.business_type==='consignment'
      ? `<span style="font-size:.6rem;background:rgba(251,191,36,.15);border:1px solid rgba(251,191,36,.4);color:#fbbf24;padding:2px 6px;margin-left:4px">CONSIGN</span>` : ''
      const sold = invoices.some(i => i.car_id === c.id)    
      return `<tr class="${sold?'row-sold':''}">
      <td><img class="t-thumb" src="${c.images?.[0]||''}" alt="${c.brand}"/></td>
      <td>
        <div class="t-name">${c.brand} ${c.model}${sold?'<span class="t-sold-tag">SOLD</span>':''}${btypeTag}</div>
        <div class="t-sub">${c.year} · ${c.km}${c.color?' · '+c.color:''}</div>
        ${c.buy_price?`<div class="t-sub" style="color:#fbbf24">Buy: ₹${c.buy_price}L${c.broker_name?' · Broker: '+c.broker_name:''}</div>`:''}
      </td>
      <td class="t-price">₹${c.price}L</td>
      <td class="t-fuel-col">${c.fuel}<br><span class="t-trans">${c.trans}</span></td>
      <td><span class="p-badge">📷 ${c.images?.length||0}</span></td>
      <td><div class="t-acts">
      <button class="t-btn t-edit" data-action="edit" data-id="${c.id}">Edit</button>
      <button class="t-btn t-invoice" data-action="invoice" data-id="${c.id}">Invoice</button>
      <button class="t-btn t-del" data-action="delete" data-id="${c.id}">Delete</button>
      </div></td>
    </tr>`}).join('')
}

// ── DASHBOARD ─────────────────────────────────────────
function renderDashStats(s) {
  const el = refs.dashStats; if (!el) return
  el.innerHTML = `
    <div class="dash-stat"><span class="ds-num">${s.totalCars}</span><small>Total Cars</small></div>
    <div class="dash-stat"><span class="ds-num" style="color:#22C55E">${s.activeCars}</span><small>Available</small></div>
    <div class="dash-stat"><span class="ds-num" style="color:var(--red)">${s.soldCars}</span><small>Sold</small></div>
    <div class="dash-stat"><span class="ds-num">₹${fmt(s.totalRev)}</span><small>Total Revenue</small></div>
    <div class="dash-stat"><span class="ds-num">₹${fmt(s.monthRev)}</span><small>This Month</small></div>`
}
// ── LEADS ─────────────────────────────────────────────
function renderCarFilter() {
  const el = refs.leadFilterCar; if (!el) return
  el.innerHTML = `<option value="">All Cars</option>` +
    adminCars.map(c => `<option value="${c.id}">${c.brand} ${c.model} (${c.year})</option>`).join('')
}
function renderLeads(totalLeads, perCar, recent) {
  const el = refs.leadsSection; if (!el) return
  const srcLabel = s => ({
    whatsapp_card:'💬 WA Card', whatsapp_detail:'💬 WA Detail',
    whatsapp_banner:'💬 WA Banner', whatsapp_inquiry:'💬 WA Inquiry',
    call_card:'📞 Call Card', call_detail:'📞 Call Detail', manual:'✏️ Manual'
  }[s]||s)
  el.innerHTML = `
    <div class="leads-stats-row">
      <div class="lead-stat-card"><div class="lead-stat-num">${totalLeads}</div><div class="lead-stat-lbl">Total Leads</div></div>
      <div class="lead-stat-card"><div class="lead-stat-num">${recent.filter(l=>l.source.includes('whatsapp')).length}</div><div class="lead-stat-lbl">WhatsApp</div></div>
      <div class="lead-stat-card"><div class="lead-stat-num">${recent.filter(l=>l.source.includes('call')).length}</div><div class="lead-stat-lbl">Calls</div></div>
      <div class="lead-stat-card"><div class="lead-stat-num">${recent.filter(l=>l.source==='manual').length}</div><div class="lead-stat-lbl">Manual</div></div>
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
            ${adminCars.filter(c=>c.status==='available').map(c =>
              `<option value="${c.id}" data-brand="${c.brand}" data-model="${c.model}" data-price="${c.price}">${c.brand} ${c.model} (${c.year})</option>`
            ).join('')}
          </select>
        </div>
        <div class="fg"><label>Notes</label><input class="fi" id="ml_notes" placeholder="Any notes…"/></div>
        <button class="t-btn t-edit" id="addManualLeadBtn" style="align-self:flex-end;padding:9px 16px;white-space:nowrap">+ Add Lead</button>
      </div>
    </div>
    <div class="leads-grid">
      <div class="leads-panel">
        <h3 class="leads-panel-title">Top Cars by Leads</h3>
        ${perCar.length ? `<table class="adm-table">
          <thead><tr><th>Car</th><th>Price</th><th>Leads</th></tr></thead>
          <tbody>${perCar.slice(0,10).map(l => `<tr>
            <td><strong>${l.brand} ${l.model}</strong></td>
            <td style="color:rgba(255,255,255,.4)">₹${l.price}L</td>
            <td><div style="display:flex;align-items:center;gap:8px">
              <div style="width:${Math.min(l.count*14,140)}px;height:6px;background:var(--red);border-radius:3px"></div>
              <strong style="color:var(--red)">${l.count}</strong>
            </div></td>
          </tr>`).join('')}</tbody>
        </table>` : '<p class="tbl-empty" style="display:block">No leads yet.</p>'}
      </div>
      <div class="leads-panel">
        <h3 class="leads-panel-title">Recent Leads <small style="font-size:.6rem;color:rgba(255,255,255,.3);font-weight:400">— newest first</small></h3>
        ${recent.length ? `<table class="adm-table">
          <thead><tr><th>Time</th><th>Car</th><th>Customer</th><th>Source</th><th>Status</th></tr></thead>
          <tbody>${recent.slice(0,30).map(l => `<tr>
            <td style="font-size:.72rem;color:rgba(255,255,255,.4);white-space:nowrap">${fmtDate(l.created_at)}</td>
            <td><strong>${l.brand} ${l.model}</strong>${l.price ? `<br><span style="color:rgba(255,255,255,.3);font-size:.68rem">₹${l.price}L</span>` : ''}</td>
            <td style="font-size:.78rem">${l.customer_name||'—'}<br><span style="color:rgba(255,255,255,.35)">${l.customer_phone||''}</span></td>
            <td><span class="lead-source-badge lead-source-${l.source.split('_')[0]}">${srcLabel(l.source)}</span></td>
            <td>
              <select class="lead-status-sel" data-lead-id="${l.id}" style="background:#111;border:1px solid ${l.lead_status==='New'?'rgba(204,30,30,.4)':l.lead_status==='Contacted'?'rgba(251,191,36,.4)':'rgba(34,197,94,.4)'};color:${l.lead_status==='New'?'var(--red)':l.lead_status==='Contacted'?'#fbbf24':'#22C55E'};font-size:.65rem;padding:3px 6px;border-radius:2px">
                <option value="New" ${l.lead_status==='New'?'selected':''}>🔴 New</option>
                <option value="Contacted" ${l.lead_status==='Contacted'?'selected':''}>🟡 Contacted</option>
                <option value="Closed" ${l.lead_status==='Closed'?'selected':''}>🟢 Closed</option>
              </select>
            </td>
          </tr>`).join('')}</tbody>
        </table>` : '<p class="tbl-empty" style="display:block">No leads.</p>'}
      </div>
    </div>`
  // Rebind manual lead button after innerHTML set
  document.getElementById('addManualLeadBtn')?.addEventListener('click', handleManualLead)
  // Status dropdowns — event delegation
  el.querySelectorAll('.lead-status-sel').forEach(sel => {
    sel.addEventListener('change', async e => {
      const leadId = parseInt(sel.dataset.leadId)
      const newStatus = sel.value
      try {
        await updateLeadStatus(leadId, newStatus)
        // Update color immediately
        sel.style.borderColor = newStatus==='New'?'rgba(204,30,30,.4)':newStatus==='Contacted'?'rgba(251,191,36,.4)':'rgba(34,197,94,.4)'
        sel.style.color = newStatus==='New'?'var(--red)':newStatus==='Contacted'?'#fbbf24':'#22C55E'
      } catch(err) { console.error('Status update failed:', err) }
    })
  })
}

async function handleManualLead() {
  const name  = document.getElementById('ml_name')?.value.trim()
  const phone = document.getElementById('ml_phone')?.value.trim()
  const carSel = document.getElementById('ml_car')
  const notes = document.getElementById('ml_notes')?.value.trim()
  if (!name && !phone) { showToast('Enter customer name or phone','error'); return }
  const opt = carSel?.options[carSel.selectedIndex]
  const carId  = carSel?.value ? parseInt(carSel.value) : null
  const brand  = opt?.dataset.brand || 'General'
  const model  = opt?.dataset.model || 'Enquiry'
  const price  = parseFloat(opt?.dataset.price) || 0
  try {
    await createManualLead({ car_id: carId, brand, model, price,
      customer_name: name, customer_phone: phone, notes })
    showToast('✅ Lead added','success')
    ;['ml_name','ml_phone','ml_notes'].forEach(id => { const el=document.getElementById(id); if(el) el.value='' })
    loadLeads()
  } catch { showToast('❌ Failed to add lead','error') }
}

// ── INVOICES ──────────────────────────────────────────
function renderInvoiceList() {
  const el = refs.invoiceList; if (!el) return
  if (!invoices.length) { el.innerHTML='<p class="tbl-empty" style="display:block">No invoices yet.</p>'; return }

  const normal   = invoices.filter(i => !i.invoice_type || i.invoice_type === 'normal')
  const parkSell = invoices.filter(i => i.invoice_type === 'park_sell')

  const buildRow = inv => `<tr>
      <td style="color:var(--red);font-weight:700">${inv.sr_no}</td>
      <td class="t-sub">${fmtDate(inv.sale_date||inv.created_at)}</td>
      <td class="t-sub">${inv.model_name||inv.reg_no||'—'}</td>
      <td><div class="t-name">${inv.purchaser_name}</div><div class="t-sub">${inv.purchaser_mobile}</div></td>
      <td class="t-price" style="font-size:1rem">₹${fmtINR(inv.total_amount)}</td>
      <td>
        <a class="t-btn t-edit" href="invoice.html?view=${inv.id}">View</a>
        <button class="t-btn broker-btn" data-broker='${JSON.stringify({
          brokerage: inv.brokerage,
          broker: inv.broker_name,
          notes: inv.admin_notes
        })}'>💰</button>
      </td>
    </tr>`

  const buildTable = rows => rows.length
    ? `<table class="adm-table">
        <thead><tr><th>Sr No</th><th>Date</th><th>Vehicle</th><th>Purchaser</th><th>Amount</th><th>Action</th></tr></thead>
        <tbody>${rows.map(buildRow).join('')}</tbody>
       </table>`
    : '<p class="tbl-empty" style="display:block">None yet.</p>'

  el.innerHTML = `
    <div class="inv-section-label">NORMAL INVOICES</div>
    ${buildTable(normal)}
    <div class="inv-section-label inv-section-label--park" style="margin-top:28px">PARK &amp; SELL INVOICES</div>
    ${buildTable(parkSell)}
  `
}

// ── HELPERS ───────────────────────────────────────────
function fmt(v) { const n=Number(v)||0; return n>=100000?(n/100000).toFixed(2)+'L':n.toLocaleString('en-IN') }
function fmtINR(v) { return (Number(v)||0).toLocaleString('en-IN',{maximumFractionDigits:0}) }
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})
}

// TAB SWITCHING (WORKS WITH YOUR CODE)

const buttons = document.querySelectorAll(".adm-tab-btn");
const tabs = document.querySelectorAll(".adm-tab-pane");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {

    // remove active from all
    buttons.forEach(b => b.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));

    // activate clicked button
    btn.classList.add("active");

    // get target tab
    const target = btn.getAttribute("data-tab");

    // show correct section
    document.getElementById(`tab-${target}`).classList.add("active");
  });
});


function showBrokerageModal(data) {
  document.getElementById('bm_amount').textContent = data.brokerage || '0'
  document.getElementById('bm_name').textContent = data.broker || '—'
  document.getElementById('bm_notes').textContent = data.notes || '—'

  document.getElementById('brokerModal').style.display = 'flex'
}

// =====================================================
// EXPENSES MODULE — appended below all existing code
// Zero modifications to any function above this line
// =====================================================

// ── STATE ─────────────────────────────────────────────
let expActiveCategory = 'rent'      // current pill tab
let expGlobalMonthYear = ''         // current month filter ('YYYY-MM')
let expEditingId = null             // id of row being inline-edited

// ── INIT: called once when Expenses tab is first clicked ──
async function initExpenses() {
  buildGlobalMonthDropdown()
  setupExpPillTabs()
  await loadExpenseDashboard()
  await renderExpCategory(expActiveCategory)
}

// ── GLOBAL MONTH DROPDOWN ─────────────────────────────
// Always shows at minimum: current month + last 11 months
// If DB has older data, those months are added too
function buildGlobalMonthDropdown() {
  const sel = document.getElementById('expGlobalMonth')
  if (!sel) return

  const options = buildMonthOptions()
  sel.innerHTML = options.map(({ value, label }) =>
    `<option value="${value}" ${value === expGlobalMonthYear ? 'selected' : ''}>${label}</option>`
  ).join('')

  sel.addEventListener('change', async () => {
    expGlobalMonthYear = sel.value
    await loadExpenseDashboard()
    await renderExpCategory(expActiveCategory)
  })
}

// Build last 24 months as option list (no Supabase call needed here)
function buildMonthOptions() {
  const now   = new Date()
  const opts  = []
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const value = `${y}-${m}`
    opts.push({ value, label: fmtMonthYear(value) })
  }
  return opts
}

// ── PILL TABS ─────────────────────────────────────────
function setupExpPillTabs() {
  document.querySelectorAll('.exp-pill').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.exp-pill').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      expActiveCategory = btn.dataset.cat
      expEditingId = null
      await renderExpCategory(expActiveCategory)
    })
  })
}

// ── DASHBOARD STRIP ───────────────────────────────────
async function loadExpenseDashboard() {
  try {
    const { total, byCategory } = await fetchExpenseSummary(expGlobalMonthYear || null)
    const fmtINR = v => '₹' + (v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
    setEl('expSumTotal',  fmtINR(total))
    setEl('expSumRent',   fmtINR(byCategory.rent))
    setEl('expSumElec',   fmtINR(byCategory.electricity))
    setEl('expSumMaint',  fmtINR(byCategory.maintenance))
    setEl('expSumSalary', fmtINR(byCategory.salary))
    setEl('expSumMisc',   fmtINR(byCategory.misc))
  } catch(e) {
    console.error('[loadExpenseDashboard]', e)
  }
}

// ── ROUTE CATEGORY RENDER ─────────────────────────────
async function renderExpCategory(cat) {
  const panel = document.getElementById('expCategoryPanel')
  if (!panel) return

  panel.innerHTML = '<p class="tbl-empty" style="display:block">Loading…</p>'

  try {
    switch (cat) {
      case 'rent':        await renderRent(panel);        break
      case 'electricity': await renderElectricity(panel); break
      case 'maintenance': await renderGrouped(panel, 'maintenance', 'Maintenance Entry'); break
      case 'misc':        await renderGrouped(panel, 'misc', 'Misc Entry'); break
      case 'salary':      await renderSalary(panel);      break
    }
  } catch(e) {
    console.error('[renderExpCategory]', e)
    panel.innerHTML = `<p class="tbl-empty" style="display:block">Failed to load. Check console.</p>`
  }
}

// ── SHARED HELPER: set element text ───────────────────
function setEl(id, text) {
  const el = document.getElementById(id)
  if (el) el.textContent = text
}

// ── SHARED HELPER: format date for display ─────────────
function fmtExpDate(d) {
  if (!d) return '—'
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── SHARED HELPER: format currency ────────────────────
function fmtRs(v) {
  return '₹' + (Number(v) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

// ── SHARED HELPER: today's date as YYYY-MM-DD ─────────
function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// ── SHARED HELPER: current YYYY-MM ────────────────────
function currentMonthYear() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// ── SHARED: delete handler (used by all categories) ───
async function handleExpDelete(id) {
  if (!confirm('Delete this expense entry?')) return
  try {
    await deleteExpense(id)
    showToast('🗑 Entry deleted', 'info')
    await loadExpenseDashboard()
    await renderExpCategory(expActiveCategory)
  } catch(e) {
    showToast('❌ Delete failed', 'error')
  }
}

// ── SHARED: add expense + refresh (all categories) ────
async function handleExpAdd(payload) {
  try {
    await addExpense(payload)
    showToast('✅ Saved', 'success')
    await loadExpenseDashboard()
    await renderExpCategory(expActiveCategory)
  } catch(e) {
    showToast('❌ ' + e.message, 'error')
  }
}

// ══════════════════════════════════════════════════════
// RENT — one entry per month
// ══════════════════════════════════════════════════════
async function renderRent(panel) {
  const my     = expGlobalMonthYear || currentMonthYear()
  const rows   = await fetchExpensesByType('rent')   // all history
  const curRow = rows.find(r => r.month_year === my) || null

  panel.innerHTML = `
    ${renderSingleEntryForm('rent', my, curRow, ['bill_no'], 'Rent')}
    ${renderMonthRowList(rows, false)}
  `

  bindSingleEntryForm(panel, 'rent', my, curRow)
}

// ══════════════════════════════════════════════════════
// ELECTRICITY — one entry per month, has bill_no
// ══════════════════════════════════════════════════════
async function renderElectricity(panel) {
  const my     = expGlobalMonthYear || currentMonthYear()
  const rows   = await fetchExpensesByType('electricity')
  const curRow = rows.find(r => r.month_year === my) || null

  panel.innerHTML = `
    ${renderSingleEntryForm('electricity', my, curRow, ['bill_no'], 'Electricity Bill')}
    ${renderMonthRowList(rows, true)}
  `

  bindSingleEntryForm(panel, 'electricity', my, curRow)
}

// ── Shared: month selector HTML (replaces broken date input) ──
function monthSelectorHTML(idPrefix, defaultMonthYear) {
  const [defY, defM] = (defaultMonthYear || currentMonthYear()).split('-').map(Number)
  const months = [
    ['01','January'],['02','February'],['03','March'],['04','April'],
    ['05','May'],['06','June'],['07','July'],['08','August'],
    ['09','September'],['10','October'],['11','November'],['12','December']
  ]
  const now = new Date()
  const years = []
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) years.push(y)

  const mOpts = months.map(([v,l]) => `<option value="${v}" ${Number(v)===defM?'selected':''}>${l}</option>`).join('')
  const yOpts = years.map(y => `<option value="${y}" ${y===defY?'selected':''}>${y}</option>`).join('')

  return `
    <div class="fg" style="display:flex;gap:8px;align-items:flex-end">
      <div style="flex:1"><label>Month *</label>
        <select class="fs" id="${idPrefix}Month">${mOpts}</select>
      </div>
      <div style="flex:1"><label>Year *</label>
        <select class="fs" id="${idPrefix}Year">${yOpts}</select>
      </div>
    </div>`
}

// ── Shared: get YYYY-MM-DD from month+year selectors ──
function monthSelectorValue(panel, idPrefix) {
  const m = panel.querySelector(`#${idPrefix}Month`)?.value
  const y = panel.querySelector(`#${idPrefix}Year`)?.value
  if (!m || !y) return null
  return `${y}-${m}-01`
}

// ── Shared: HTML for single-entry form (rent/elec) ────
function renderSingleEntryForm(type, my, existing, extras = [], label = '') {
  const isEdit = !!existing
  const notice = isEdit
    ? `<div class="exp-notice">⚠️ Entry exists for ${fmtMonthYear(my)}. Saving will update it.</div>`
    : ''

  const billField = extras.includes('bill_no')
    ? `<div class="fg"><label>Bill No. (optional)</label>
         <input class="fi" id="expBillNo" placeholder="e.g. EL-44" value="${existing?.bill_no || ''}"/></div>`
    : ''

  // For new entries: month selector instead of broken date input
  const dateField = !isEdit
    ? monthSelectorHTML('expEntry', expGlobalMonthYear || currentMonthYear())
    : ''

  return `
  <div class="exp-form-panel">
    <h3>${label.toUpperCase()} — ${fmtMonthYear(my)}</h3>
    ${notice}
    <div class="exp-form-row">
      <div class="fg"><label>Amount (₹) *</label>
        <input class="fi" id="expAmount" type="number" placeholder="0" value="${existing?.amount || ''}"/>
      </div>
      ${billField}
      ${dateField}
      <div class="fg"><label>Note</label>
        <input class="fi" id="expNote" placeholder="Optional note" value="${existing?.note || ''}"/>
      </div>
      <div class="exp-form-actions">
        <button class="add-btn" id="expSaveBtn" style="width:auto;padding:9px 20px;font-size:.72rem">
          ${isEdit ? '✓ UPDATE' : '+ SAVE'}
        </button>
      </div>
    </div>
  </div>
  `
}

// ── Bind single-entry form save ────────────────────────
function bindSingleEntryForm(panel, type, my, existing) {
  panel.querySelector('#expSaveBtn')?.addEventListener('click', async () => {
    const amount  = panel.querySelector('#expAmount')?.value
    const note    = panel.querySelector('#expNote')?.value || ''
    const bill_no = panel.querySelector('#expBillNo')?.value || null

    if (!amount || parseFloat(amount) <= 0) {
      showToast('Enter a valid amount', 'error'); return
    }

    if (existing) {
      // UPDATE existing row — no date change needed
      try {
        await updateExpense(existing.id, { amount, note, bill_no })
        showToast('✅ Updated', 'success')
        await loadExpenseDashboard()
        await renderExpCategory(expActiveCategory)
      } catch(e) { showToast('❌ ' + e.message, 'error') }
    } else {
      // INSERT new row — derive date from month+year selectors
      const date = monthSelectorValue(panel, 'expEntry')
      if (!date) { showToast('Select month and year', 'error'); return }
      await handleExpAdd({ type, amount, date, note, bill_no })
    }
  })
}

// ── Shared: render month-row list (rent/electricity) ───
function renderMonthRowList(rows, showBillNo = false) {
  if (!rows.length) return `<div class="exp-history"><p class="exp-empty">No history yet.</p></div>`

  const items = rows.map(r => `
    <div class="exp-month-row" data-id="${r.id}">
      <span class="exp-month-label">${fmtMonthYear(r.month_year)}</span>
      <span class="exp-month-note">
        ${showBillNo && r.bill_no ? `<strong>${r.bill_no}</strong> — ` : ''}${r.note || ''}
      </span>
      <span class="exp-month-amount">${fmtRs(r.amount)}</span>
      <div class="exp-row-actions">
        <button class="t-btn t-del" data-del-id="${r.id}">Delete</button>
      </div>
    </div>
  `).join('')

  return `
    <div class="exp-history">
      <p class="exp-history-header">History</p>
      ${items}
    </div>
  `
}

// ══════════════════════════════════════════════════════
// MAINTENANCE + MISC — multiple entries, grouped by month
// ══════════════════════════════════════════════════════
async function renderGrouped(panel, type, formLabel) {
  // Pass month filter: null = all history, string = only that month
  const filterMonth = expGlobalMonthYear || null
  const groups = await fetchGroupedByMonth(type, filterMonth)

  panel.innerHTML = `
    <div class="exp-form-panel">
      <h3>${formLabel.toUpperCase()}</h3>
      <div class="exp-form-row">
        ${monthSelectorHTML('expGrp', expGlobalMonthYear || currentMonthYear())}
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
      ${renderGroupedHistory(groups)}
    </div>
  `

  panel.querySelector('#expSaveBtn')?.addEventListener('click', async () => {
    const date = monthSelectorValue(panel, 'expGrp')
    const note = panel.querySelector('#expDesc')?.value?.trim()
    const amount = panel.querySelector('#expAmount')?.value

    if (!date)   { showToast('Select month and year', 'error'); return }
    if (!note)   { showToast('Description is required', 'error'); return }
    if (!amount || parseFloat(amount) <= 0) { showToast('Enter a valid amount', 'error'); return }

    await handleExpAdd({ type, amount, date, note })
    // clear form fields after save
    const descEl = panel.querySelector('#expDesc')
    const amtEl  = panel.querySelector('#expAmount')
    if (descEl) descEl.value = ''
    if (amtEl)  amtEl.value = ''
  })
}

// ── Grouped history HTML ───────────────────────────────
function renderGroupedHistory(groups) {
  if (!groups.length) return `<p class="exp-empty">No entries yet.</p>`

  return groups.map(g => `
    <div class="exp-group-block">
      <div class="exp-group-head">
        <span class="exp-group-month">${fmtMonthYear(g.month_year)}</span>
        <span class="exp-group-total">Total: ${fmtRs(g.total)}</span>
      </div>
      ${g.entries.map(e => `
        <div class="exp-entry-row">
          <span class="exp-entry-date">${fmtExpDate(e.date)}</span>
          <span class="exp-entry-desc">${e.note || '—'}</span>
          <span class="exp-entry-amount">${fmtRs(e.amount)}</span>
          <button class="t-btn t-del" data-del-id="${e.id}" style="flex-shrink:0">Delete</button>
        </div>
      `).join('')}
    </div>
  `).join('')
}

// ══════════════════════════════════════════════════════
// SALARY — per staff, grouped by staff name
// ══════════════════════════════════════════════════════
async function renderSalary(panel) {
  const my     = expGlobalMonthYear || null
  const groups = await fetchSalaryByStaff(my)

  panel.innerHTML = `
    <div class="exp-form-panel">
      <h3>SALARY PAYMENT</h3>
      <div class="exp-form-row">
        <div class="fg"><label>Staff Name *</label>
          <input class="fi" id="expStaff" placeholder="Full name" list="staffNameList"/>
          <datalist id="staffNameList">
            ${groups.map(g => `<option value="${g.staff}">`).join('')}
          </datalist>
        </div>
        <div class="fg"><label>Amount (₹) *</label>
          <input class="fi" id="expAmount" type="number" placeholder="0"/>
        </div>
        ${monthSelectorHTML('expSal', expGlobalMonthYear || currentMonthYear())}
        <div class="fg"><label>Note (optional)</label>
          <input class="fi" id="expNote" placeholder="e.g. April salary"/>
        </div>
        <div class="exp-form-actions">
          <button class="add-btn" id="expSaveBtn" style="width:auto;padding:9px 20px;font-size:.72rem">+ ADD</button>
        </div>
      </div>
    </div>
    ${my ? `<p class="exp-notice" style="margin-bottom:14px">📅 Showing: ${fmtMonthYear(my)}</p>` : ''}
    <div class="exp-history" id="expSalaryHistory">
      ${renderSalaryHistory(groups)}
    </div>
  `

  panel.querySelector('#expSaveBtn')?.addEventListener('click', async () => {
    const staff  = panel.querySelector('#expStaff')?.value?.trim()
    const amount = panel.querySelector('#expAmount')?.value
    const date   = monthSelectorValue(panel, 'expSal')
    const note   = panel.querySelector('#expNote')?.value?.trim() || null

    if (!staff)  { showToast('Enter staff name', 'error'); return }
    if (!amount || parseFloat(amount) <= 0) { showToast('Enter a valid amount', 'error'); return }
    if (!date)   { showToast('Select month and year', 'error'); return }

    await handleExpAdd({ type: 'salary', amount, date, note, staff })
  })
}

// ── Salary history HTML ────────────────────────────────
function renderSalaryHistory(groups) {
  if (!groups.length) return `<p class="exp-empty">No salary records yet.</p>`

  return groups.map(g => `
    <div class="exp-staff-card">
      <div class="exp-staff-head">
        <span class="exp-staff-name">${g.staff}</span>
        <span class="exp-staff-total">${fmtRs(g.total)}</span>
      </div>
      ${g.entries.map(e => `
        <div class="exp-entry-row">
          <span class="exp-entry-date">${fmtExpDate(e.date)}</span>
          <span class="exp-entry-desc">${e.note || 'Salary payment'}</span>
          <span class="exp-entry-amount">${fmtRs(e.amount)}</span>
          <button class="t-btn t-del" data-del-id="${e.id}" style="flex-shrink:0">Delete</button>
        </div>
      `).join('')}
    </div>
  `).join('')
}

// ── GLOBAL DELETE DELEGATION for expense panels ────────
// One listener handles delete buttons across all rendered categories
document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-del-id]')
  if (!btn) return
  // Only handle if we're inside the expenses tab panel
  if (!btn.closest('#expCategoryPanel')) return
  await handleExpDelete(parseInt(btn.dataset.delId))
})

// ── WIRE EXPENSES TAB into existing tab system ─────────
// The existing tab switch code at the bottom of admin.js handles
// show/hide of panes. We only need to trigger initExpenses on first visit.
let expInitialized = false
document.addEventListener('click', async e => {
  const btn = e.target.closest('.adm-tab-btn')
  if (!btn || btn.dataset.tab !== 'expenses') return
  if (!expInitialized) {
    expInitialized = true
    // Set default month to current before first render
    expGlobalMonthYear = currentMonthYear()
    // Sync the dropdown to current month once DOM is ready
    setTimeout(() => {
      const sel = document.getElementById('expGlobalMonth')
      if (sel) sel.value = expGlobalMonthYear
    }, 0)
    await initExpenses()
  }
})
