import { createClient } from '@supabase/supabase-js'

// THAY BẰNG THÔNG TIN CỦA BẠN
const supabaseUrl = 'https://nxoyegibbztgzdueznbd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3llZ2liYnp0Z3pkdWV6bmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NjM2OTksImV4cCI6MjA4MTMzOTY5OX0.XUsjuqEr_fEHBB3-o7LmQ5kj-3tT0BaJUtzry9Dg9jc' // Lấy từ: Settings → API → anon public

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export default supabase