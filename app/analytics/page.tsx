import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { GlobalAnalytics } from '@/components/analytics/global-analytics'

export const metadata = {
  title: 'Analytics - ColdEmail Pro',
  description: 'View your campaign analytics',
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <GlobalAnalytics user={user} />
}
