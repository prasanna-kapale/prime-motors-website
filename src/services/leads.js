// =====================================================
// PRIME MOTORS — src/services/leads.js
// Full lead capture: stores before WhatsApp redirect
// Supports lead_status: New / Contacted / Closed
// =====================================================
import { supabase } from './supabase.js'

/**
 * Track lead on WA/Call click — stores FIRST, then caller redirects.
 * Returns the inserted lead id (or null on failure).
 * NEVER throws — WhatsApp redirect must always work.
 */
export async function trackLead(car, source, extra = {}) {
  try {
    const payload = {
      car_id:        car.id    || null,
      brand:         car.brand || '',
      model:         car.model || '',
      price:         car.price || 0,
      source,
      customer_name:  extra.customer_name  || '',
      customer_phone: extra.customer_phone || '',
      notes:          extra.notes          || '',
      lead_status:   'New',
      created_at:    new Date().toISOString(),
    }
    const { data, error } = await supabase.from('leads').insert([payload]).select('id').single()
    if (error) {
      console.warn('[trackLead] DB insert failed (redirect still works):', error.message)
      return null
    }
    console.log('[trackLead] Lead saved, id:', data?.id)
    return data?.id || null
  } catch (e) {
    console.warn('[trackLead] Exception (redirect still works):', e.message)
    return null
  }
}

/**
 * WhatsApp Inquiry — store lead then open WA.
 * Guaranteed: WA opens even if DB fails.
 */
export async function waInquiry(car, waUrl) {
  // Store lead first (non-blocking)
  await trackLead(car, 'whatsapp_inquiry')
  // Always redirect
  window.open(waUrl, '_blank', 'noopener')
}

/** Admin: create manual lead */
export async function createManualLead(leadData) {
  const { data, error } = await supabase.from('leads')
    .insert([{ ...leadData, source: 'manual', lead_status: leadData.lead_status || 'New' }])
    .select().single()
  if (error) throw error
  return data
}

/** Update lead status */
export async function updateLeadStatus(id, lead_status) {
  const { data, error } = await supabase.from('leads')
    .update({ lead_status }).eq('id', id).select().single()
  if (error) throw error
  return data
}

/** Fetch all leads (with optional car filter) */
export async function fetchLeads(carId = null) {
  let q = supabase.from('leads').select('*').order('created_at', { ascending: false })
  if (carId) q = q.eq('car_id', carId)
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function fetchRecentLeads(limit = 50) {
  const { data, error } = await supabase.from('leads')
    .select('*').order('created_at', { ascending: false }).limit(limit)
  if (error) throw error
  return data || []
}

export async function fetchLeadsPerCar() {
  const { data, error } = await supabase.from('leads')
    .select('car_id,brand,model,price').order('created_at', { ascending: false })
  if (error) throw error
  const map = {}
  for (const l of (data || [])) {
    const k = l.car_id || `${l.brand}_${l.model}`
    if (!map[k]) map[k] = { car_id: l.car_id, brand: l.brand, model: l.model, price: l.price, count: 0 }
    map[k].count++
  }
  return Object.values(map).sort((a,b) => b.count - a.count)
}

export async function fetchLeadCount() {
  const { count, error } = await supabase.from('leads')
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count || 0
}
