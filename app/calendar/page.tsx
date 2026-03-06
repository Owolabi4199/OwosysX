import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { CalendarContent } from '@/components/calendar/calendar-content'

export const metadata = {
  title: 'Calendar & Bookings - ColdEmail Pro',
  description: 'Manage booked calls and calendar integration',
}

export default async function CalendarPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <CalendarContent user={user} />
}
