import { createServerSupabaseClient } from '@/lib/supabase-server'

export type UserRole = 'user' | 'admin' | 'super_admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  subscription_tier: string
  subscription_status: string
  created_at: string
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data as UserProfile
}

export async function getCurrentUserWithProfile() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { user: null, profile: null }
  }

  const profile = await getUserProfile(user.id)
  
  return { user, profile }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId)
  return profile?.role === 'admin' || profile?.role === 'super_admin'
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId)
  return profile?.role === 'super_admin'
}

export async function requireAdmin() {
  const { user, profile } = await getCurrentUserWithProfile()
  
  if (!user || !profile) {
    return { authorized: false, reason: 'not_authenticated' as const }
  }

  if (profile.role !== 'admin' && profile.role !== 'super_admin') {
    return { authorized: false, reason: 'not_admin' as const }
  }

  return { authorized: true, user, profile }
}

export async function createUserProfile(
  userId: string, 
  email: string, 
  fullName?: string
): Promise<UserProfile | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName || null,
      role: 'user',
      subscription_tier: 'free',
      subscription_status: 'active'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return data as UserProfile
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
) {
  const supabase = await createServerSupabaseClient()
  
  await supabase.from('admin_audit_log').insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details: details || {},
    ip_address: ipAddress
  })
}
