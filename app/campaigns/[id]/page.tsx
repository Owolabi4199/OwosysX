import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { CampaignDetail } from '@/components/campaigns/campaign-detail'

export const metadata = {
  title: 'Campaign Details - ColdEmail Pro',
}

interface CampaignPageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { id } = await params

  return <CampaignDetail campaignId={id} user={user} />
}
