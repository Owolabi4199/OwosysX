'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-client'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface CampaignAnalyticsProps {
  campaignId: string
}

interface Analytics {
  totalLeads: number
  sent: number
  opened: number
  clicked: number
  replied: number
  qualified: number
  openRate: number
  clickRate: number
  replyRate: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function CampaignAnalytics({ campaignId }: CampaignAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Fetch all leads
        const { data: leads } = await supabase
          .from('leads')
          .select('status')
          .eq('campaign_id', campaignId)

        // Fetch email logs
        const { data: emailLogs } = await supabase
          .from('email_logs')
          .select('opened_at, clicked_at')
          .eq('campaign_id', campaignId)

        const leadsArray = leads || []
        const logsArray = emailLogs || []

        const totalLeads = leadsArray.length
        const sent = leadsArray.filter((l: any) => l.status !== 'not_sent').length
        const opened = logsArray.filter((l: any) => l.opened_at).length
        const clicked = logsArray.filter((l: any) => l.clicked_at).length
        const replied = leadsArray.filter((l: any) => l.status === 'replied').length
        const qualified = leadsArray.filter((l: any) => l.status === 'qualified').length

        setAnalytics({
          totalLeads,
          sent,
          opened,
          clicked,
          replied,
          qualified,
          openRate: sent > 0 ? (opened / sent) * 100 : 0,
          clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
          replyRate: sent > 0 ? (replied / sent) * 100 : 0,
        })
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [campaignId])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }

  if (!analytics) {
    return <div>No analytics available</div>
  }

  const statCards = [
    { label: 'Total Leads', value: analytics.totalLeads, color: 'text-blue-600' },
    { label: 'Sent', value: analytics.sent, color: 'text-green-600' },
    { label: 'Opened', value: `${analytics.opened} (${analytics.openRate.toFixed(1)}%)`, color: 'text-amber-600' },
    { label: 'Clicked', value: `${analytics.clicked} (${analytics.clickRate.toFixed(1)}%)`, color: 'text-orange-600' },
    { label: 'Replied', value: `${analytics.replied} (${analytics.replyRate.toFixed(1)}%)`, color: 'text-purple-600' },
    { label: 'Qualified', value: analytics.qualified, color: 'text-emerald-600' },
  ]

  const chartData = [
    { name: 'Sent', value: analytics.sent },
    { name: 'Opened', value: analytics.opened },
    { name: 'Clicked', value: analytics.clicked },
    { name: 'Replied', value: analytics.replied },
    { name: 'Qualified', value: analytics.qualified },
  ]

  const statusData = [
    { name: 'Sent', value: analytics.sent },
    { name: 'Replied', value: analytics.replied },
    { name: 'Qualified', value: analytics.qualified },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel Chart */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Campaign Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Lead Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
