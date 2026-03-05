import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export const metadata = {
  title: 'Dashboard - Cold Email Automation',
  description: 'Manage your cold email campaigns',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <DashboardContent user={user} />
}
