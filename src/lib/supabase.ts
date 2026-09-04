import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey)

// Evita que uma falha de rede deixe a tela de conta esperando para sempre.
const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 12_000)
  try {
    return await fetch(input, { ...init, signal: init?.signal ?? controller.signal })
  } finally {
    window.clearTimeout(timer)
  }
}

// O cliente recebe somente a publishable key. As políticas RLS protegem os dados acessíveis.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    global: { fetch: fetchWithTimeout },
  })
  : null
