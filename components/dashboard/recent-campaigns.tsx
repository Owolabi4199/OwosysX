import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'

interface Campaign {
  id: string
  name: string
  status: string
  created_at: string
}

interface RecentCampaignsProps {
  campaigns: Campaign[]
  loading: boolean
}

export function RecentCampaigns({ campaigns, loading }: RecentCampaignsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <Card>
      <div className="border-b p-6">
        <h3 className="font-semibold">Recent Campaigns</h3>
      </div>
      <div className="divide-y">
        {loading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <p>No campaigns yet. Create one to get started.</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="font-medium hover:underline"
                >
                  {campaign.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Created {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/campaigns/${campaign.id}`}>View</Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
