import { createClient } from '@supabase/supabase-js'

// Values come from .env locally and from repository secrets in the deploy workflow.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.error(
    'Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).',
  )
}

export const supabase = createClient(url, anonKey)
