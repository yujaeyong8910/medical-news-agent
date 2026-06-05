import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Admin client — server-side only, bypasses RLS
export const supabaseAdmin = createClient(url, serviceKey)

// Public client — safe for reads with RLS public read policy
export const supabase = createClient(url, anonKey)
