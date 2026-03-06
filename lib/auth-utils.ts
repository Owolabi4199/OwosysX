import { createServerSupabaseClient } from './supabase-server'

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function getCurrentWorkspace() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createServerSupabaseClient()
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching workspace:', error)
    return null
  }

  return workspace
}

export async function createWorkspace(userId: string, name: string) {
  const supabase = await createServerSupabaseClient()
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .insert([
      {
        owner_id: userId,
        name,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating workspace:', error)
    throw error
  }

  return workspace
}
