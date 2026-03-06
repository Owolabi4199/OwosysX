import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if user profile exists, create if not
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // Create user profile on first login
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || null,
          role: 'user',
          subscription_tier: 'free',
          subscription_status: 'active'
        })
        
        // Create default workspace
        await supabase.from('workspaces').insert({
          name: 'My Workspace',
          owner_id: data.user.id
        })
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
