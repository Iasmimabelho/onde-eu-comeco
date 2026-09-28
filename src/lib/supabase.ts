import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { projectId, publicAnonKey } from "../../utils/supabase/info"

// Prevent Vite HMR from creating a second GoTrueClient instance
// @ts-expect-error — decline() is a valid Vite HMR method not in all type defs
if (import.meta.hot) import.meta.hot.decline()

declare global {
  // eslint-disable-next-line no-var
  var __supabase: SupabaseClient | undefined
}

if (!globalThis.__supabase) {
  globalThis.__supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  )
}

export const supabase = globalThis.__supabase
