import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Create a single supabase client for interacting with your database
export const createServerSupabaseClient = () => {
  // Use the anon key for server-side cookie mode
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      }
    }
  )
}

// Create a client-side supabase client
export const createClientSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
