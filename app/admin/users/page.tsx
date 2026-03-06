import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AdminUsersClient } from '@/components/admin/admin-users-client'

async function getUsers() {
  const supabase = await createServerSupabaseClient()

  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return users
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="mt-1 text-muted-foreground">
          Manage platform users and their roles
        </p>
      </div>

      <AdminUsersClient initialUsers={users} />
    </div>
  )
}
