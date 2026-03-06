import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { BillingContent } from '@/components/billing/billing-content'

export const metadata = {
  title: 'Billing - ColdEmail Pro',
  description: 'Manage your subscription and billing',
}

export default async function BillingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <BillingContent userId={user.id} userEmail={user.email || ''} />
}
