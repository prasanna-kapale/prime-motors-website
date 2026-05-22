// =====================================================
// PRIME MOTORS — src/services/expenseService.js
// Isolated expense tracking — no coupling to other services
// Single table, category-aware helpers
// =====================================================
import { supabase } from './supabase.js'

// ── TYPES ─────────────────────────────────────────────
// 'rent' | 'electricity' | 'maintenance' | 'salary' | 'misc'

// ── SHARED HELPER: format date → 'YYYY-MM' ────────────
export function toMonthYear(dateStr) {
  // dateStr: 'YYYY-MM-DD' or Date object
  const d = typeof dateStr === 'string' ? dateStr : dateStr.toISOString().slice(0, 10)
  return d.slice(0, 7) // 'YYYY-MM'
}

// ── SHARED HELPER: display label for month_year ────────
export function fmtMonthYear(my) {
  // my: 'YYYY-MM'
  if (!my) return '—'
  const [y, m] = my.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m, 10) - 1]} ${y}`
}

// ── ADD EXPENSE ────────────────────────────────────────
// All categories use this one insert function.
// Caller passes only the fields relevant to their category.
export async function addExpense({ type, amount, date, note = null, staff = null, bill_no = null }) {
  const month_year = toMonthYear(date)
  const payload = {
    type,
    amount: parseFloat(amount),
    date,
    note: note || null,
    staff: staff || null,
    bill_no: bill_no || null,
    month_year,
  }
  const { data, error } = await supabase
    .from('expenses')
    .insert([payload])
    .select()
    .single()
  if (error) {
    console.error('[addExpense] error:', error)
    throw new Error(error.message || 'Failed to save expense')
  }
  return data
}

// ── DELETE EXPENSE ─────────────────────────────────────
export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) {
    console.error('[deleteExpense] error:', error)
    throw new Error(error.message || 'Failed to delete expense')
  }
}

// ── FETCH BY TYPE ──────────────────────────────────────
// Fetch all rows for one category, newest first.
// Optional month_year filter: '2026-04'
export async function fetchExpensesByType(type, month_year = null) {
  let q = supabase
    .from('expenses')
    .select('*')
    .eq('type', type)
    .order('date', { ascending: false })

  if (month_year) q = q.eq('month_year', month_year)

  const { data, error } = await q
  if (error) {
    console.error('[fetchExpensesByType] error:', error)
    throw error
  }
  return data || []
}

// ── CHECK DUPLICATE (rent / electricity) ──────────────
// Returns existing row if type+month_year combo already exists.
export async function checkDuplicate(type, month_year) {
  const { data, error } = await supabase
    .from('expenses')
    .select('id, amount, note')
    .eq('type', type)
    .eq('month_year', month_year)
    .limit(1)
  if (error) {
    console.error('[checkDuplicate] error:', error)
    return null
  }
  return data?.[0] || null
}

// ── UPDATE EXPENSE (rent / electricity edit) ───────────
export async function updateExpense(id, { amount, note, bill_no }) {
  const payload = {}
  if (amount !== undefined) payload.amount = parseFloat(amount)
  if (note    !== undefined) payload.note   = note || null
  if (bill_no !== undefined) payload.bill_no = bill_no || null

  const { data, error } = await supabase
    .from('expenses')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    console.error('[updateExpense] error:', error)
    throw new Error(error.message || 'Failed to update expense')
  }
  return data
}

// ── FETCH DASHBOARD SUMMARY ────────────────────────────
// Returns: { total, byCategory: { rent, electricity, maintenance, salary, misc } }
// for a given month_year ('YYYY-MM'). If null → all time.
export async function fetchExpenseSummary(month_year = null) {
  let q = supabase.from('expenses').select('type, amount')
  if (month_year) q = q.eq('month_year', month_year)

  const { data, error } = await q
  if (error) {
    console.error('[fetchExpenseSummary] error:', error)
    throw error
  }

  const rows = data || []
  const byCategory = { rent: 0, electricity: 0, maintenance: 0, salary: 0, misc: 0 }
  let total = 0

  for (const r of rows) {
    const amt = parseFloat(r.amount) || 0
    total += amt
    if (byCategory[r.type] !== undefined) byCategory[r.type] += amt
  }

  return { total, byCategory }
}

// ── FETCH GROUPED BY MONTH (maintenance / misc) ────────
// Returns array of { month_year, total, entries[] } sorted newest first
export async function fetchGroupedByMonth(type, month_year = null) {
  let q = supabase
    .from('expenses')
    .select('*')
    .eq('type', type)
    .order('date', { ascending: false })

  if (month_year) q = q.eq('month_year', month_year)

  const { data, error } = await q

  if (error) {
    console.error('[fetchGroupedByMonth] error:', error)
    throw error
  }

  const rows = data || []

  // Group by month_year
  const map = {}
  for (const row of rows) {
    const key = row.month_year
    if (!map[key]) map[key] = { month_year: key, total: 0, entries: [] }
    map[key].entries.push(row)
    map[key].total += parseFloat(row.amount) || 0
  }

  // Sort months newest first
  return Object.values(map).sort((a, b) => b.month_year.localeCompare(a.month_year))
}

// ── FETCH GROUPED BY STAFF (salary) ───────────────────
// Returns array of { staff, total, entries[] } sorted by staff name
// Optional month_year filter
export async function fetchSalaryByStaff(month_year = null) {
  let q = supabase
    .from('expenses')
    .select('*')
    .eq('type', 'salary')
    .order('date', { ascending: false })

  if (month_year) q = q.eq('month_year', month_year)

  const { data, error } = await q
  if (error) {
    console.error('[fetchSalaryByStaff] error:', error)
    throw error
  }

  const rows = data || []
  const map = {}

  for (const row of rows) {
    const key = (row.staff || 'Unknown').trim()
    if (!map[key]) map[key] = { staff: key, total: 0, entries: [] }
    map[key].entries.push(row)
    map[key].total += parseFloat(row.amount) || 0
  }

  return Object.values(map).sort((a, b) => a.staff.localeCompare(b.staff))
}

// ── FETCH MONTH/YEAR LIST (for filter dropdowns) ───────
// Returns array of distinct month_year strings, newest first
export async function fetchExpenseMonths() {
  const { data, error } = await supabase
    .from('expenses')
    .select('month_year')
    .order('month_year', { ascending: false })

  if (error) {
    console.error('[fetchExpenseMonths] error:', error)
    return []
  }

  const seen = new Set()
  const months = []
  for (const r of (data || [])) {
    if (!seen.has(r.month_year)) { seen.add(r.month_year); months.push(r.month_year) }
  }
  return months
}
