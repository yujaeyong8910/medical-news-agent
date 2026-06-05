import { createClient } from '@supabase/supabase-js'

// Fallback prevents build-time crash when env vars aren't set yet.
// Queries will fail at runtime if real values aren't provided.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-key'
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

// Admin client — server-side only, bypasses RLS
export const supabaseAdmin = createClient(url, serviceKey)

// Public client — safe for reads with RLS public read policy
export const supabase = createClient(url, anonKey)
