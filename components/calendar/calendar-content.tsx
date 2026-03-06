'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase-client'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface BookedCall {
  id: string
  lead_id: string
  scheduled_time: string
  duration_minutes: number
  booking_link: string | null
  completed_at: string | null
  notes: string | null
  lead_email?: string
}

interface Lead {
  id: string
  email: string
}

export function CalendarContent({ user }: { user: User }) {
  const [calls, setCalls] = useState<BookedCall[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Fetch all leads
        const { data: leadsData } = await supabase
          .from('leads')
          .select('id, email')

        // Fetch all booked calls
        const { data: callsData } = await supabase
          .from('booked_calls')
          .select('*')
          .order('scheduled_time', { ascending: true })

        setLeads(leadsData || [])

        // Add lead email to calls
        const callsWithEmail = (callsData || []).map((call: any) => ({
          ...call,
          lead_email: leadsData?.find((l) => l.id === call.lead_id)?.email,
        }))

        setCalls(callsWithEmail)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const upcomingCalls = calls.filter(
    (call) => new Date(call.scheduled_time) > new Date() && !call.completed_at
  )

  const completedCalls = calls.filter((call) => call.completed_at)

  const getStatus = (call: BookedCall) => {
    if (call.completed_at) {
      return 'Completed'
    }
    if (new Date(call.scheduled_time) < new Date()) {
      return 'Missed'
    }
    return 'Scheduled'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Missed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Calendar & Bookings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all booked calls from your campaigns
          </p>
        </div>

        {/* Calendar Integration Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Calendar Integration</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Available Integrations</h3>
              <div className="flex gap-2">
                <Button variant="outline" disabled>
                  Google Calendar
                </Button>
                <Button variant="outline" disabled>
                  Calendly
                </Button>
                <Button variant="outline" disabled>
                  Microsoft Teams
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Calendar integrations coming soon. Booked calls are stored in the database.
              </p>
            </div>
          </div>
        </Card>

        {/* Upcoming Calls */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Upcoming Calls ({upcomingCalls.length})
            </h2>
            <p className="text-sm text-muted-foreground">
              Calls scheduled for the future
            </p>
          </div>

          <Card>
            {loading ? (
              <div className="space-y-4 p-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingCalls.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-4 size-8 text-muted-foreground" />
                <p>No upcoming calls scheduled</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Booking Link</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingCalls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell className="font-medium">
                        {call.lead_email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="size-4 text-muted-foreground" />
                          {format(
                            new Date(call.scheduled_time),
                            'MMM d, yyyy HH:mm'
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{call.duration_minutes} min</TableCell>
                      <TableCell>
                        {call.booking_link ? (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={call.booking_link} target="_blank" rel="noopener noreferrer">
                              <MapPin className="size-4 mr-1" />
                              Join
                            </a>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(getStatus(call))}>
                          {getStatus(call)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        {/* Completed Calls */}
        {completedCalls.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">
                Completed Calls ({completedCalls.length})
              </h2>
              <p className="text-sm text-muted-foreground">
                Calls that have been completed
              </p>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedCalls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell className="font-medium">
                        {call.lead_email}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(call.scheduled_time),
                          'MMM d, yyyy HH:mm'
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(call.completed_at!), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{call.duration_minutes} min</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {call.notes || '-'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
