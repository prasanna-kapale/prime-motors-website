// =====================================================
// PRIME MOTORS — src/services/invoiceService.js
// FIXED: car marked sold ONLY after successful insert
// FIXED: proper error logging
// =====================================================
import { supabase } from './supabase.js'
import { markCarSold } from './inventory.js'

/** Get next sequential invoice number: POB1, POB2, POB3... */
export async function generateNextSrNo() {
  const { data, error } = await supabase
    .from('invoices')
    .select('sr_no')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.warn('[generateNextSrNo] error:', error)
    return 'POB1'
  }
  if (!data?.length) return 'POB1'

  const last = data[0].sr_no || ''
  const matchPOB = last.match(/POB(\d+)/i)
  const matchPM  = last.match(/PM-(\d+)/)
  if (matchPOB) return `POB${parseInt(matchPOB[1]) + 1}`
  if (matchPM)  return `POB${parseInt(matchPM[1]) + 1}`
  return 'POB1'
}

// =====================================================
// FIX 1: Insert invoice FIRST, mark car sold ONLY on success
// FIX 2: Strip unknown fields that don't exist in schema
// FIX 3: Full console logging of Supabase response
// =====================================================
export async function createInvoice(rawInv) {
  // Only include columns that exist in the invoices table schema
  // IMPORTANT: 'payment_modes' is NOT a column — remove it to prevent error
  const inv = {
    sr_no:                rawInv.sr_no,
    sale_date:            rawInv.sale_date || new Date().toISOString().slice(0, 10),
    sale_time:            rawInv.sale_time            || '',
    car_id:               rawInv.car_id               || null,
    registered_owner:     rawInv.registered_owner     || '',
    owner_so:             rawInv.owner_so             || '',
    owner_ro:             rawInv.owner_ro             || '',
    reg_no:               rawInv.reg_no               || '',
    model_name:           rawInv.model_name           || '',
    class_of_vehicle:     rawInv.class_of_vehicle     || '',
    makers_name:          rawInv.makers_name          || '',
    chassis_no:           rawInv.chassis_no           || '',
    date_of_registration: rawInv.date_of_registration || '',
    engine_no:            rawInv.engine_no            || '',
    type_of_body:         rawInv.type_of_body         || '',
    colour:               rawInv.colour               || '',
    other_info:           rawInv.other_info           || '',
    total_amount:         Number(rawInv.total_amount) || 0,
    total_amount_words:   rawInv.total_amount_words   || '',
    advance:              Number(rawInv.advance)      || 0,
    balance:              Number(rawInv.balance)      || 0,
    // payments is JSONB — send as array
    payments:             Array.isArray(rawInv.payments) ? rawInv.payments : [],
    through_dealer:       rawInv.through_dealer       || '',
    shop_name:            rawInv.shop_name            || '',
    dealer_mobile:        rawInv.dealer_mobile        || '',
    seller_name:          rawInv.seller_name          || '',
    seller_so:            rawInv.seller_so            || '',
    seller_address:       rawInv.seller_address       || '',
    seller_mobile:        rawInv.seller_mobile        || '',
    purchaser_name:       rawInv.purchaser_name       || '',
    purchaser_so:         rawInv.purchaser_so         || '',
    purchaser_address:    rawInv.purchaser_address    || '',
    purchaser_mobile:     rawInv.purchaser_mobile     || '',
    brokerage:            rawInv.brokerage            ?? null,
    broker_name:          rawInv.broker_name          || '',
    admin_notes:          rawInv.admin_notes          || '',
    // Park & Sell fields
    invoice_type:         rawInv.invoice_type         || 'normal',
    commission_percentage:rawInv.commission_percentage ?? null,
    commission_amount:    rawInv.commission_amount     ?? null,
    owner_payout:         rawInv.owner_payout          ?? null,
    car_owner_name:       rawInv.car_owner_name        || null,
    car_owner_phone:      rawInv.car_owner_phone       || null,
    parking_duration:     rawInv.parking_duration      || null,
  }

  console.log('[createInvoice] Payload being sent to Supabase:', inv)

  // STEP 1: Insert invoice — do NOT touch car status yet
  const { data, error } = await supabase
    .from('invoices')
    .insert([inv])
    .select()
    .single()

  // Full response log for debugging
  console.log('[createInvoice] Supabase response → data:', data, '| error:', error)

  if (error) {
    console.error('[createInvoice] Insert failed. Code:', error.code, '| Message:', error.message, '| Details:', error.details)
    throw new Error(error.message || 'Invoice insert failed')
  }

  // STEP 2: Mark car sold ONLY if invoice insert succeeded
  if (inv.car_id) {
    try {
      await markCarSold(inv.car_id)
      console.log('[createInvoice] Car', inv.car_id, 'marked as sold ✅')
    } catch (soldErr) {
      console.error('[createInvoice] Invoice saved but markCarSold failed:', soldErr)
      // Don't throw — invoice is saved, just log the warning
    }
  }

  return data
}

export async function fetchInvoices() {
  const { data, error } = await supabase
    .from('invoices').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('[fetchInvoices] error:', error)
    throw error
  }
  return data || []
}

export async function fetchInvoiceById(id) {
  const { data, error } = await supabase
    .from('invoices').select('*').eq('id', id).single()
  if (error) {
    console.error('[fetchInvoiceById] error:', error)
    throw error
  }
  return data
}

export async function fetchDashboardStats() {
  const [carsRes, invRes] = await Promise.all([
    supabase.from('cars').select('id,status,price'),
    supabase.from('invoices').select('total_amount,created_at'),
  ])
  if (carsRes.error) throw carsRes.error
  if (invRes.error)  throw invRes.error
  const cars = carsRes.data || [], invs = invRes.data || []
  const totalRev = invs.reduce((s,i) => s + (Number(i.total_amount)||0), 0)
  const now = new Date()
  const mo = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const monthRev = invs.filter(i => (i.created_at||'').startsWith(mo))
    .reduce((s,i) => s + (Number(i.total_amount)||0), 0)
  return {
    totalCars:  cars.length,
    activeCars: cars.filter(c => c.status==='available').length,
    soldCars:   cars.filter(c => c.status==='sold').length,
    totalRev, monthRev,
  }
}
