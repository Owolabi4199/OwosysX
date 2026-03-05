'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail } from 'lucide-react'
import { format } from 'date-fns'

interface Reply {
  id: string
  lead_id: string
  reply_text: string
  categorized_as: string | null
  received_at: string
  human_reviewed: boolean
  campaign_id: string
  lead_email?: string
}

interface Lead {
  id: string
  email: string
}

export function RepliesContent({ user }: { user: User }) {
  const [replies, setReplies] = useState<Reply[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Fetch all leads
        const { data: leadsData } = await supabase
          .from('leads')
          .select('id, email')

        // Fetch all replies
        const { data: repliesData } = await supabase
          .from('replies')
          .select('*')
          .order('received_at', { ascending: false })

        setLeads(leadsData || [])
        
        // Add lead email to replies
        const repliesWithEmail = (repliesData || []).map((reply: any) => ({
          ...reply,
          lead_email: leadsData?.find((l) => l.id === reply.lead_id)?.email,
        }))

        setReplies(repliesWithEmail)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'interested':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'not_interested':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'out_of_office':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'spam':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  const filteredReplies =
    selectedCategory === 'all'
      ? replies
      : replies.filter((reply) => reply.categorized_as === selectedCategory)

  const categories = [
    'interested',
    'not_interested',
    'out_of_office',
    'spam',
    'other',
  ]

  const categoryCounts = {
    all: replies.length,
    ...categories.reduce(
      (acc, cat) => ({
        ...acc,
        [cat]: replies.filter((r) => r.categorized_as === cat).length,
      }),
      {}
    ),
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Email Replies</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and categorize all incoming replies
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{categoryCounts.all}</p>
          </Card>
          {categories.map((category) => (
            <Card key={category} className="p-4">
              <p className="text-sm text-muted-foreground capitalize">
                {category.replace('_', ' ')}
              </p>
              <p className="text-2xl font-bold">
                {categoryCounts[category as keyof typeof categoryCounts] || 0}
              </p>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by category:</span>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Replies</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() +
                    category.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredReplies.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="mx-auto mb-4 size-8 text-muted-foreground" />
              <p className="text-muted-foreground">No replies yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Reviewed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReplies.map((reply) => (
                  <TableRow key={reply.id}>
                    <TableCell className="font-medium">
                      {reply.lead_email}
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(reply.categorized_as)}>
                        {reply.categorized_as || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-muted-foreground">
                        {reply.reply_text}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(reply.received_at), 'MMM d, HH:mm')}
                    </TableCell>
                    <TableCell>
                      {reply.human_reviewed ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
