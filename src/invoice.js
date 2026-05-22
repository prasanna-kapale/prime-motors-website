// =====================================================
// PRIME MOTORS — src/invoice.js
// Delivery Note Cum Intermediator Receipt
// Exact layout matching physical invoice format
// =====================================================
import './styles/style.css'
import './styles/invoice.css'
import { fetchAvailableCars }         from './services/inventory.js'
import { createInvoice, generateNextSrNo,
         fetchInvoiceById }           from './services/invoiceService.js'
import { showToast }                  from './components/toast.js'
import { USE_SUPABASE }               from './services/supabase.js'

let availableCars = [], selectedCar = null, isViewMode = false
let invoiceType = 'normal'  // 'normal' | 'park_sell'
let srNo = 'PM-0001' // will be set async
// Multiple payment rows
let payments = [{ mode: 'Cash', amount: '', ref: '' }]

const params  = new URLSearchParams(window.location.search)
const carId   = params.get('car')
const viewId  = params.get('view')
const doPrint = params.get('print')

document.addEventListener('DOMContentLoaded', async () => {
  if (!USE_SUPABASE) { showToast('Configure Supabase in .env','error'); return }
  if (viewId) { await loadView(viewId) }
  else        { await initNew() }
  bindEvents()
})

// ── INIT NEW ──────────────────────────────────────────
async function initNew() {
  try {
    availableCars = await fetchAvailableCars()
    srNo = await generateNextSrNo()
    renderCarDropdown()
    if (carId) {
      const sel = document.getElementById('inv_car')
      if (sel) { sel.value = carId; handleCarSelect() }
    }
    // Set today
    const today = new Date().toISOString().slice(0,10)
    const dEl = document.getElementById('inv_date'); if (dEl) dEl.value = today
    // Set time
    const tEl = document.getElementById('inv_time')
    // Fix: type="time" needs HH:MM in 24-hour format
    if (tEl) {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      tEl.value = `${hh}:${mm}`
    }
    document.getElementById('srNoDisplay').textContent = srNo
    renderPaymentRows()
    injectParkSellUI()
    updateCalc()
    livePreview()
  } catch(e) { console.error(e); showToast('Failed to load cars','error') }
}

// ── INJECT PARK & SELL UI ─────────────────────────────
// Inserts type toggle + P&S fields into the existing form
// Relies on a container with id="invFormPanel" or falls back to form body
function injectParkSellUI() {
  // Find injection anchor — insert after the car selector row
  const carRow = document.getElementById('inv_car')?.closest('.fg-row') || document.getElementById('inv_car')?.parentElement
  if (!carRow) return

  // Type toggle (insert before car row)
  const toggleWrap = document.createElement('div')
  toggleWrap.className = 'fg-row'
  toggleWrap.style.marginBottom = '16px'
  toggleWrap.innerHTML = `
    <div class="fg" style="max-width:340px">
      <label style="font-size:.65rem;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:6px;display:block">Invoice Type</label>
      <div class="inv-type-toggle">
        <button type="button" class="inv-type-btn active" id="invTypeNormal">Normal Sale</button>
        <button type="button" class="inv-type-btn" id="invTypePark">Park &amp; Sell</button>
      </div>
    </div>
  `
  carRow.parentElement.insertBefore(toggleWrap, carRow)

  // Park & Sell fields (hidden by default) — insert after carRow
  const parkFields = document.createElement('div')
  parkFields.className = 'park-show'
  parkFields.style.display = 'none'
  parkFields.innerHTML = `
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
  `
  carRow.insertAdjacentElement('afterend', parkFields)

  // Re-bind events since DOM changed
  document.getElementById('invTypeNormal')?.addEventListener('click', () => toggleInvoiceType('normal'))
  document.getElementById('invTypePark')?.addEventListener('click', () => toggleInvoiceType('park_sell'))
  document.getElementById('inv_commission_pct')?.addEventListener('input', () => { calcParkSell(); livePreview() })
}

function renderCarDropdown() {
  const sel = document.getElementById('inv_car'); if (!sel) return
  sel.innerHTML = `<option value="">— Manual Entry (no inventory car) —</option>` +
    availableCars.map(c => `<option value="${c.id}"
      data-brand="${c.brand}" data-model="${c.model}" data-year="${c.year}"
      data-color="${c.color||''}" data-fuel="${c.fuel}" data-price="${c.price}">
      ${c.brand} ${c.model} (${c.year}) — ₹${c.price}L
    </option>`).join('')
}

function handleCarSelect() {
  const sel = document.getElementById('inv_car')
  if (!sel?.value) { selectedCar = null; return }
  const id = parseInt(sel.value)
  selectedCar = availableCars.find(c => c.id === id) || null
  if (!selectedCar) return
  // Auto-fill vehicle fields
  const sv = (eid, v) => { const el=document.getElementById(eid); if (el && !el.value) el.value = v||'' }
  sv('inv_model', `${selectedCar.brand} ${selectedCar.model}`)
  sv('inv_makers', selectedCar.brand)
  sv('inv_colour', selectedCar.color)
  // Auto-fill total amount
  const amtEl = document.getElementById('inv_total')
  if (amtEl && !amtEl.value) amtEl.value = Math.round(selectedCar.price * 100000)
  updateCalc()
}

// ── VIEW MODE ─────────────────────────────────────────
async function loadView(id) {
  isViewMode = true
  try {
    const inv = await fetchInvoiceById(id)
    if (!inv) { showToast('Invoice not found','error'); return }
    // Hide form panel
    const formPanel = document.getElementById('invFormPanel')
    if (formPanel) formPanel.style.display = 'none'
    renderPrintDoc(inv)
    if (doPrint) setTimeout(() => window.print(), 600)
  } catch(e) { console.error(e); showToast('Failed to load invoice','error') }
}

// ── PAYMENT ROWS ──────────────────────────────────────
function renderPaymentRows() {
  const container = document.getElementById('paymentRows'); if (!container) return
  container.innerHTML = payments.map((p,i) => `
    <div class="pay-row">
      <select class="fs pay-mode" data-pidx="${i}">
        <option value="Cash" ${p.mode==='Cash'?'selected':''}>Cash</option>
        <option value="Online" ${p.mode==='Online'?'selected':''}>Online / UPI</option>
        <option value="Cheque" ${p.mode==='Cheque'?'selected':''}>Cheque</option>
        <option value="Finance" ${p.mode==='Finance'?'selected':''}>Finance / Loan</option>
      </select>
      <input class="fi pay-amount" type="number" placeholder="Amount ₹" value="${p.amount||''}" data-pidx="${i}" />
      <input class="fi pay-ref" placeholder="Ref / Cheque No (optional)" value="${p.ref||''}" data-pidx="${i}" />
      ${payments.length>1 ? `<button class="pay-rm" data-pidx="${i}">✕</button>` : '<div></div>'}
    </div>`).join('')
  updateCalc()
}

function addPaymentRow() { payments.push({ mode:'Cash', amount:'', ref:'' }); renderPaymentRows() }

function handlePaymentChange(e) {
  const el = e.target; const idx = parseInt(el.dataset.pidx); if (isNaN(idx)) return
  if (el.classList.contains('pay-mode'))   payments[idx].mode   = el.value
  if (el.classList.contains('pay-amount')) payments[idx].amount = el.value
  if (el.classList.contains('pay-ref'))    payments[idx].ref    = el.value
  if (el.classList.contains('pay-rm'))     { payments.splice(idx,1); renderPaymentRows() }
  updateCalc()
  livePreview()
}

function updateCalc() {
  const total   = parseFloat(document.getElementById('inv_total')?.value) || 0
  const advance = parseFloat(document.getElementById('inv_advance')?.value) || 0
  const balance = total - advance
  const balEl = document.getElementById('inv_balance')
  if (balEl) balEl.value = balance > 0 ? balance.toFixed(0) : '0'
  // Update payment received display
  const paidTotal = payments.reduce((s,p) => s + (parseFloat(p.amount)||0), 0)
  const paidEl = document.getElementById('inv_paid_display')
  if (paidEl) paidEl.textContent = `₹${paidTotal.toLocaleString('en-IN')}`
}

// ── SAVE ──────────────────────────────────────────────
async function handleSave() {
  const g = id => document.getElementById(id)?.value?.trim() || ''
  const n = id => parseFloat(document.getElementById(id)?.value) || 0

  const purchaserName = g('inv_purchaser_name')
  const purchaserMob  = g('inv_purchaser_mob')
  if (!purchaserName) { showToast('Enter purchaser name','error'); return }
  if (!purchaserMob)  { showToast('Enter purchaser mobile','error'); return }

  const totalAmount = n('inv_total')
  if (totalAmount <= 0) { showToast('Enter total amount','error'); return }

  const btn = document.getElementById('saveBtn')
  if (btn) { btn.disabled=true; btn.textContent='⏳ Saving…' }

  const paidRows = payments.filter(p => p.amount && parseFloat(p.amount) > 0)
  const paidModes = paidRows.map(p => p.mode).join(' / ')

  // Park & Sell calculations
  const commissionPct = invoiceType === 'park_sell' ? (parseFloat(g('inv_commission_pct')) || 0) : null
  const commissionAmt = invoiceType === 'park_sell' ? Math.round(totalAmount * (commissionPct / 100)) : null
  const ownerPayout   = invoiceType === 'park_sell' ? Math.round(totalAmount - commissionAmt) : null

  const inv = {
    sr_no: srNo, sale_date: g('inv_date')||new Date().toISOString().slice(0,10),
    sale_time: g('inv_time'), car_id: selectedCar?.id || null,
    registered_owner: g('inv_reg_owner'), owner_so: g('inv_owner_so'), owner_ro: g('inv_owner_ro'),
    reg_no: g('inv_reg_no'), model_name: g('inv_model'), class_of_vehicle: g('inv_class'),
    makers_name: g('inv_makers'), chassis_no: g('inv_chassis'), date_of_registration: g('inv_doreg'),
    engine_no: g('inv_engine'), type_of_body: g('inv_bodytype'), colour: g('inv_colour'),
    other_info: g('inv_other'),
    total_amount: totalAmount, total_amount_words: g('inv_amount_words'),
    advance: n('inv_advance'), balance: n('inv_balance'),
    payments: paidRows, // payment_modes removed — not a DB column
    through_dealer: g('inv_dealer'), shop_name: g('inv_shop'), dealer_mobile: g('inv_dealer_mob'),
    seller_name: g('inv_seller_name'), seller_so: g('inv_seller_so'),
    seller_address: g('inv_seller_addr'), seller_mobile: g('inv_seller_mob'),
    purchaser_name: purchaserName, purchaser_so: g('inv_purchaser_so'),
    purchaser_address: g('inv_purchaser_addr'), purchaser_mobile: purchaserMob,
    // Admin-only
    brokerage: parseFloat(g('inv_brokerage')) || null,
    broker_name: g('inv_broker'),
    admin_notes: g('inv_admin_notes'),
    // Park & Sell fields
    invoice_type:          invoiceType,
    commission_percentage: commissionPct,
    commission_amount:     commissionAmt,
    owner_payout:          ownerPayout,
    car_owner_name:        invoiceType === 'park_sell' ? g('inv_car_owner_name') : null,
    car_owner_phone:       invoiceType === 'park_sell' ? g('inv_car_owner_phone') : null,
    parking_duration:      invoiceType === 'park_sell' ? g('inv_parking_duration') : null,
    // NOTE: 'payment_modes' is NOT inserted — it's not a DB column.
    // payments (JSONB array) is sent instead — handled by invoiceService.js
  }

  // Debug: log what we're sending
  console.log('[handleSave] Invoice payload:', JSON.stringify(inv, null, 2))

  try {
    console.log('[handleSave] Calling createInvoice...')
    const saved = await createInvoice(inv)
    
    // 🔥 DELETE CAR AFTER INVOICE
    if (selectedCar?.id) {
      const { deleteCar } = await import('./services/inventory.js')
      await deleteCar(selectedCar.id)
    }
    console.log('[handleSave] Success! Saved invoice id:', saved?.id)
    const msg = inv.car_id ? '✅ Invoice saved! Car marked sold.' : '✅ Invoice saved!'
    showToast(msg, 'success')
    setTimeout(() => { window.open(`invoice.html?view=${saved.id}`, '_blank'); window.location.href = 'admin.html' }, 1200)
  } catch(e) {
    console.error('[handleSave] FAILED:', e?.message || e)
    showToast('❌ Save failed: ' + (e?.message || 'Unknown error'), 'error')
    if (btn) { btn.disabled = false; btn.textContent = '💾 SAVE INVOICE' }
  }
}

// ── RENDER PRINTABLE DOCUMENT ─────────────────────────
function renderPrintDoc(inv) {
  const el = document.getElementById('printDocWrap'); if (!el) return
  // Build payment description from JSONB payments array
  const pModes = Array.isArray(inv.payments) && inv.payments.length
    ? inv.payments
        .filter(p => p.amount && parseFloat(p.amount) > 0)
        .map(p => `${p.mode} ₹${Number(p.amount).toLocaleString('en-IN')}${p.ref ? ' (' + p.ref + ')' : ''}`)
        .join(' + ') || '—'
    : '—'

  el.innerHTML = buildInvoiceDoc(inv, pModes)
}

function buildInvoiceDoc(inv, pModes) {
  const blank = (label, val, cls='') =>
    `<div class="inv-field ${cls}">
      <span class="inv-label">${label}</span>
      <span class="inv-line">${val || ''}</span>
    </div>`

  const blankPair = (l1, v1, l2, v2) =>
    `<div class="inv-field-pair">
      ${blank(l1, v1)}
      ${blank(l2, v2)}
    </div>`

  const fmtINR = v => (Number(v) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return `<div class="invoice-doc" id="invoiceDoc">

    <!-- WATERMARK: grayscale logo, 7% opacity -->
    <div class="doc-watermark">
      <img src="/logo-wm.png" alt="" />
    </div>

    <!-- HEADER: logo top-center, no box/shadow -->
    <div class="doc-header">
      <div class="doc-header-left">
        <div class="doc-srno-row">
          Sr. No. : <span class="sr-red">${inv.sr_no || ''}</span>
        </div>
        <div class="doc-meta-row">
          <strong>Date :</strong>
          <span class="meta-line">${inv.sale_date ? new Date(inv.sale_date + 'T00:00:00').toLocaleDateString('en-IN', {day:'2-digit', month:'2-digit', year:'numeric'}) : ''}</span>
        </div>
        <div class="doc-meta-row">
          <strong>Time :</strong>
          <span class="meta-line">${inv.sale_time || ''}</span>
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
        ${blank('Registered Owner', inv.registered_owner, 'full-width')}
        ${blankPair('S/o', inv.owner_so, 'R/o', inv.owner_ro)}
      </div>

      <!-- VEHICLE DETAILS -->
      <div class="doc-section">
        <div class="doc-section-header">Vehicle Details</div>
        ${blankPair('Bearing Reg. No', inv.reg_no, 'Model', inv.model_name)}
        ${blankPair('1. Class of Vehicle', inv.class_of_vehicle, '2. Maker\'s Name', inv.makers_name)}
        ${blankPair('3. Chassis No', inv.chassis_no, '4. Date of Registration', inv.date_of_registration)}
        ${blankPair('5. Engine No', inv.engine_no, '6. Type of Body', inv.type_of_body)}
        ${blankPair('7. Colour of Vehicle', inv.colour, '8. Other', inv.other_info)}
      </div>

      <!-- FINANCIALS -->
      <div class="doc-section">
        <div class="doc-section-header">Financial Details</div>
        <div class="financials-block">
          <div class="inv-total-row">
            <div class="inv-total-box">
              <span class="inv-label" style="font-size:11px">9. Total Amount :</span>
              <span class="inv-amount-box">₹${fmtINR(inv.total_amount)}</span>
            </div>
            <div class="inv-words-field">
              <span class="inv-label">(In words)</span>
              <span class="inv-line">${inv.total_amount_words || ''}</span>
            </div>
          </div>
          ${blankPair('10. Advance :', inv.advance ? '₹' + fmtINR(inv.advance) : '', 'Balance', inv.balance ? '₹' + fmtINR(inv.balance) : '')}
        </div>

        <div class="payment-received-row">
          <span class="inv-label">Received with Cash / Cheque / Online payment :</span>
          <span class="inv-line">${pModes || ''}</span>
        </div>
      </div>

      <!-- DEALER -->
      <div class="doc-section">
        <div class="doc-section-header">Dealer Information</div>
        <div class="dealer-strip">
          ${blank('Through Dealer', inv.through_dealer)}
          ${blank('Shop Name', inv.shop_name)}
          ${blank('Mobile No.', inv.dealer_mobile)}
          <div class="inv-field"><span class="inv-label">T. Dealers Signature</span><span class="inv-sig-line"></span></div>
        </div>
      </div>

      <!-- SELLER / PURCHASER -->
      <div class="doc-addresses">
        <div class="doc-addr-col">
          <div class="addr-heading">Seller Address</div>
          ${blank('Name', inv.seller_name)}
          ${blank('S/o', inv.seller_so)}
          ${blank('Add', inv.seller_address)}
          ${blank('Mob.', inv.seller_mobile)}
          <div class="sig-row"><span class="sig-label">Seller's Signature</span></div>
        </div>
        <div class="doc-addr-col">
          <div class="addr-heading">Purchaser Address</div>
          ${blank('Name', inv.purchaser_name)}
          ${blank('S/o', inv.purchaser_so)}
          ${blank('Add', inv.purchaser_address)}
          ${blank('Mob.', inv.purchaser_mobile)}
          <div class="sig-row"><span class="sig-label">Purchaser Signature</span></div>
        </div>
      </div>

      <!-- PARK & SELL: admin-only block (screen only, hidden in print) -->
      ${inv.invoice_type === 'park_sell' ? `
      <div class="doc-section park-sell-admin-block">
        <div class="doc-section-header" style="color:#e01e2a">Park &amp; Sell — Internal Details (Not Printed)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:10px;color:#444">
          <div><strong>Car Owner:</strong> ${inv.car_owner_name || '—'}</div>
          <div><strong>Owner Phone:</strong> ${inv.car_owner_phone || '—'}</div>
          <div><strong>Commission:</strong> ${inv.commission_percentage || 0}% = ₹${(Number(inv.commission_amount)||0).toLocaleString('en-IN')}</div>
          <div><strong>Owner Payout:</strong> ₹${(Number(inv.owner_payout)||0).toLocaleString('en-IN')}</div>
          ${inv.parking_duration ? `<div><strong>Parking Duration:</strong> ${inv.parking_duration}</div>` : ''}
        </div>
      </div>` : ''}

      <!-- AUTHORIZED SIGNATURE / STAMP (right-aligned) -->
      <div class="doc-auth-stamp">
        <div class="doc-stamp-box">
          <div class="doc-stamp-space"></div>
          <div class="doc-stamp-label">Authorized Signature</div>
          <div class="doc-stamp-sublabel">For Prime Motors</div>
        </div>
      </div>

    </div><!-- /doc-body -->
  </div>` // /invoice-doc
}


// ── PARK & SELL CALC ─────────────────────────────────
function calcParkSell() {
  const total = parseFloat(document.getElementById('inv_total')?.value) || 0
  const pct   = parseFloat(document.getElementById('inv_commission_pct')?.value) || 0
  const commission = Math.round(total * pct / 100)
  const payout     = Math.round(total - commission)
  const commEl   = document.getElementById('inv_commission_amt')
  const payoutEl = document.getElementById('inv_owner_payout')
  if (commEl)   commEl.value   = commission
  if (payoutEl) payoutEl.value = payout
}

function toggleInvoiceType(type) {
  invoiceType = type
  const normalFields  = document.querySelectorAll('.park-hide')
  const parkFields    = document.querySelectorAll('.park-show')
  const btnNormal     = document.getElementById('invTypeNormal')
  const btnPark       = document.getElementById('invTypePark')
  if (type === 'park_sell') {
    normalFields.forEach(el => el.style.display = 'none')
    parkFields.forEach(el   => el.style.display = '')
    if (btnNormal) btnNormal.classList.remove('active')
    if (btnPark)   btnPark.classList.add('active')
  } else {
    normalFields.forEach(el => el.style.display = '')
    parkFields.forEach(el   => el.style.display = 'none')
    if (btnNormal) btnNormal.classList.add('active')
    if (btnPark)   btnPark.classList.remove('active')
  }
  livePreview()
}

// ── LIVE PREVIEW ─────────────────────────────────────
function livePreview() {
  if (isViewMode) return
  const g = id => document.getElementById(id)?.value?.trim() || ''
  const n = id => parseFloat(document.getElementById(id)?.value) || 0

  const total   = n('inv_total')
  const advance = n('inv_advance')
  const balance = total - advance
  const paidModes = payments.filter(p => p.amount && parseFloat(p.amount) > 0)
    .map(p => `${p.mode} ₹${Number(p.amount).toLocaleString('en-IN')}${p.ref ? ' ('+p.ref+')' : ''}`).join(' + ')

  const inv = {
    sr_no:               document.getElementById('srNoDisplay')?.textContent || '',
    sale_date:           g('inv_date'),
    sale_time:           g('inv_time'),
    business_address:    'Beside Vidhya Niketan, Nagpur Road, Chandrapur',
    registered_owner:    g('inv_reg_owner'),
    owner_so:            g('inv_owner_so'),
    owner_ro:            g('inv_owner_ro'),
    reg_no:              g('inv_reg_no'),
    model_name:          g('inv_model'),
    class_of_vehicle:    g('inv_class'),
    makers_name:         g('inv_makers'),
    chassis_no:          g('inv_chassis'),
    date_of_registration:g('inv_doreg'),
    engine_no:           g('inv_engine'),
    type_of_body:        g('inv_bodytype'),
    colour:              g('inv_colour'),
    other_info:          g('inv_other'),
    total_amount:        total,
    total_amount_words:  g('inv_amount_words'),
    advance:             advance,
    balance:             balance > 0 ? balance : 0,
    through_dealer:      g('inv_dealer'),
    shop_name:           g('inv_shop'),
    dealer_mobile:       g('inv_dealer_mob'),
    seller_name:         g('inv_seller_name'),
    seller_so:           g('inv_seller_so'),
    seller_address:      g('inv_seller_addr'),
    seller_mobile:       g('inv_seller_mob'),
    purchaser_name:      g('inv_purchaser_name'),
    purchaser_so:        g('inv_purchaser_so'),
    purchaser_address:   g('inv_purchaser_addr'),
    purchaser_mobile:    g('inv_purchaser_mob'),
  }

  const el = document.getElementById('printDocWrap')
  if (el) el.innerHTML = buildInvoiceDoc(inv, paidModes)
}

// ── EVENTS ────────────────────────────────────────────
function bindEvents() {
  document.getElementById('inv_car')?.addEventListener('change', handleCarSelect)
  document.getElementById('inv_total')?.addEventListener('input', () => { updateCalc(); livePreview() })
  document.getElementById('inv_advance')?.addEventListener('input', () => { updateCalc(); livePreview() })
  // Wire all form fields to live preview
  const liveIds = ['inv_date','inv_time','inv_reg_owner','inv_owner_so','inv_owner_ro',
    'inv_reg_no','inv_model','inv_class','inv_makers','inv_chassis','inv_doreg',
    'inv_engine','inv_bodytype','inv_colour','inv_other','inv_amount_words',
    'inv_dealer','inv_shop','inv_dealer_mob',
    'inv_seller_name','inv_seller_so','inv_seller_addr','inv_seller_mob',
    'inv_purchaser_name','inv_purchaser_so','inv_purchaser_addr','inv_purchaser_mob']
  liveIds.forEach(id => {
    const el = document.getElementById(id)
    if (!el) return
    el.addEventListener('input', livePreview)
    // 'change' fires on mobile date/time pickers
    el.addEventListener('change', livePreview)
  })
  document.getElementById('paymentRows')?.addEventListener('change', handlePaymentChange)
  document.getElementById('paymentRows')?.addEventListener('click', handlePaymentChange)
  document.getElementById('paymentRows')?.addEventListener('input', handlePaymentChange)
  document.getElementById('addPayRowBtn')?.addEventListener('click', addPaymentRow)
  document.getElementById('saveBtn')?.addEventListener('click', handleSave)
  document.getElementById('invTypeNormal')?.addEventListener('click', () => toggleInvoiceType('normal'))
  document.getElementById('invTypePark')?.addEventListener('click', () => toggleInvoiceType('park_sell'))
  document.getElementById('inv_commission_pct')?.addEventListener('input', calcParkSell)
  document.getElementById('inv_total')?.addEventListener('input', calcParkSell)
  document.getElementById('printBtn')?.addEventListener('click', () => window.print())
  document.getElementById('backBtn')?.addEventListener('click', () => { window.location.href='admin.html' })
}

function fmtDate(d) {
  if (!d) return ''
  const dt = typeof d==='string' && d.length===10 ? new Date(d+'T00:00:00') : new Date(d)
  return dt.toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'})
}
