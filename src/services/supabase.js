// =====================================================
// PRIME MOTORS — src/services/supabase.js
// Supabase client — singleton, always required
// =====================================================
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error(
    '❌ Supabase credentials missing.\n' +
    'Copy .env.example → .env and fill in your credentials.\n' +
    'See SETUP.md for instructions.'
  )
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder')
export const USE_SUPABASE = !!(url && key)
