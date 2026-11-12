import { createClient } from '@supabase/supabase-js'

// Values come from .env locally and from repository secrets in the deploy workflow.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.error(
    'Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).',
  )
}

// createClient throws when the URL is missing, which would leave the whole
// page blank. Export null instead so callers can show a proper error.
export const supabase = url && anonKey ? createClient(url, anonKey) : null
