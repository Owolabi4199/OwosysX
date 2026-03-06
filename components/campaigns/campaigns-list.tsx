'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
import Link from 'next/link'
import { format } from 'date-fns'

interface Campaign {
  id: string
  name: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
}

interface CampaignsListProps {
  campaigns: Campaign[]
  loading: boolean
}

export function CampaignsList({ campaigns, loading }: CampaignsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <div className="space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">No campaigns yet</p>
          <Button asChild>
            <Link href="/campaigns/new">Create your first campaign</Link>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="hover:underline"
                >
                  {campaign.name}
                </Link>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(campaign.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(campaign.updated_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/campaigns/${campaign.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
