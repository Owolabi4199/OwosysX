import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { AllLeadsContent } from '@/components/leads/all-leads-content'

export const metadata = {
  title: 'Leads - ColdEmail Pro',
  description: 'Manage your leads',
}

export default async function LeadsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <AllLeadsContent user={user} />
}
