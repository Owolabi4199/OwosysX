// Re-export server utilities - only use in Server Components, Route Handlers, and Server Actions
export { createServerSupabaseClient } from './supabase-server'

// Re-export client utilities - only use in Client Components
export { createBrowserSupabaseClient } from './supabase-client'
