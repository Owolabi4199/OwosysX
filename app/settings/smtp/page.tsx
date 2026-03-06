import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { SMTPSettings } from '@/components/settings/smtp-settings'

export const metadata = {
  title: 'SMTP Configuration - ColdEmail Pro',
}

export default async function SMTPSettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <SMTPSettings user={user} />
}
