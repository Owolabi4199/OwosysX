import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { CampaignWizard } from '@/components/campaigns/campaign-wizard'

export const metadata = {
  title: 'New Campaign - ColdEmail Pro',
  description: 'Create a new cold email campaign',
}

export default async function NewCampaignPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <CampaignWizard user={user} />
}
