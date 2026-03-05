import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, Users, Send, CheckCircle } from 'lucide-react'

interface Stats {
  totalCampaigns: number
  totalLeads: number
  emailsSent: number
  qualified: number
}

interface DashboardStatsProps {
  stats: Stats
  loading: boolean
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  const statItems = [
    {
      label: 'Total Campaigns',
      value: stats.totalCampaigns,
      icon: Mail,
      color: 'text-blue-500',
    },
    {
      label: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      label: 'Emails Sent',
      value: stats.emailsSent,
      icon: Send,
      color: 'text-green-500',
    },
    {
      label: 'Qualified Leads',
      value: stats.qualified,
      icon: CheckCircle,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="p-6">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <Icon className={`${item.color} size-5`} />
                </div>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
