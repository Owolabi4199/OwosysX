import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { CampaignsContent } from '@/components/campaigns/campaigns-content'

export const metadata = {
  title: 'Campaigns - ColdEmail Pro',
  description: 'Manage your email campaigns',
}

export default async function CampaignsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <CampaignsContent user={user} />
}
