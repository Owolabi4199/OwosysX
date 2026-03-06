'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase-client'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface GlobalAnalyticsProps {
  user: User
}

interface CampaignStats {
  id: string
  name: string
  sent: number
  opened: number
  clicked: number
  replied: number
  qualified: number
}

export function GlobalAnalytics({ user }: GlobalAnalyticsProps) {
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([])
  const [loading, setLoading] = useState(true)
  const [totalStats, setTotalStats] = useState({
    campaigns: 0,
    sent: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    qualified: 0,
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Fetch all campaigns
        const { data: campaignsData } = await supabase
          .from('campaigns')
          .select('id, name')

        if (!campaignsData) {
          setLoading(false)
          return
        }

        // Fetch stats for each campaign
        const campaignStats = await Promise.all(
          campaignsData.map(async (campaign) => {
            const { data: leads } = await supabase
              .from('leads')
              .select('status')
              .eq('campaign_id', campaign.id)

            const { data: emailLogs } = await supabase
              .from('email_logs')
              .select('opened_at, clicked_at')
              .eq('campaign_id', campaign.id)

            const leadsArray = leads || []
            const logsArray = emailLogs || []

            return {
              id: campaign.id,
              name: campaign.name,
              sent: leadsArray.filter((l: any) => l.status !== 'not_sent').length,
              opened: logsArray.filter((l: any) => l.opened_at).length,
              clicked: logsArray.filter((l: any) => l.clicked_at).length,
              replied: leadsArray.filter((l: any) => l.status === 'replied').length,
              qualified: leadsArray.filter((l: any) => l.status === 'qualified')
                .length,
            }
          })
        )

        setCampaigns(campaignStats)

        // Calculate totals
        const totals = campaignStats.reduce(
          (acc, campaign) => ({
            campaigns: acc.campaigns + 1,
            sent: acc.sent + campaign.sent,
            opened: acc.opened + campaign.opened,
            clicked: acc.clicked + campaign.clicked,
            replied: acc.replied + campaign.replied,
            qualified: acc.qualified + campaign.qualified,
          }),
          { campaigns: 0, sent: 0, opened: 0, clicked: 0, replied: 0, qualified: 0 }
        )

        setTotalStats(totals)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const statCards = [
    { label: 'Active Campaigns', value: totalStats.campaigns },
    { label: 'Total Sent', value: totalStats.sent },
    { label: 'Total Opened', value: `${totalStats.opened} (${totalStats.sent > 0 ? ((totalStats.opened / totalStats.sent) * 100).toFixed(1) : 0}%)` },
    { label: 'Total Clicked', value: `${totalStats.clicked} (${totalStats.sent > 0 ? ((totalStats.clicked / totalStats.sent) * 100).toFixed(1) : 0}%)` },
    { label: 'Total Replied', value: totalStats.replied },
    { label: 'Qualified Leads', value: totalStats.qualified },
  ]

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Track performance across all your campaigns
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {statCards.map((stat) => (
            <Card key={stat.label} className="p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Campaign Comparison */}
        {campaigns.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Campaign Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaigns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
                  <Bar dataKey="opened" fill="#10b981" name="Opened" />
                  <Bar dataKey="replied" fill="#8b5cf6" name="Replied" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Conversion Rates</h3>
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="space-y-1">
                    <p className="text-sm font-medium">{campaign.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${campaign.sent > 0 ? (campaign.opened / campaign.sent) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span>
                        {campaign.sent > 0
                          ? ((campaign.opened / campaign.sent) * 100).toFixed(1)
                          : 0}
                        % Open Rate
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {campaigns.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            No campaigns yet. Create a campaign to see analytics.
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
