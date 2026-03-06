import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-auth'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { authorized, profile } = await requireAdmin()

  if (!authorized) {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar profile={profile!} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
