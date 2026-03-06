import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { RepliesContent } from '@/components/replies/replies-content'

export const metadata = {
  title: 'Replies - ColdEmail Pro',
  description: 'Manage email replies',
}

export default async function RepliesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <RepliesContent user={user} />
}
