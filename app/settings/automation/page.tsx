import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { AutomationSettings } from '@/components/settings/automation-settings'

export const metadata = {
  title: 'Automation Settings - ColdEmail Pro',
}

export default async function AutomationSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <AutomationSettings user={user} />
}
