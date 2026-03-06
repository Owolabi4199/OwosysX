'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-client'
import { User } from '@supabase/supabase-js'
import { DashboardLayout } from './dashboard-layout'
import { DashboardStats } from './dashboard-stats'
import { RecentCampaigns } from './recent-campaigns'
import { QuickActions } from './quick-actions'

interface Campaign {
  id: string
  name: string
  status: string
  created_at: string
}

interface Stats {
  totalCampaigns: number
  totalLeads: number
  emailsSent: number
  qualified: number
}

export function DashboardContent({ user }: { user: User }) {
  const [stats, setStats] = useState<Stats>({
    totalCampaigns: 0,
    totalLeads: 0,
    emailsSent: 0,
    qualified: 0,
  })
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createBrowserSupabaseClient()

        // Fetch campaigns
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('id, name, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        if (campaignsError) throw campaignsError

        // Fetch stats
        const { data: allCampaigns } = await supabase
          .from('campaigns')
          .select('id')

        const { data: allLeads } = await supabase
          .from('leads')
          .select('id, status')

        const { data: emailLogs } = await supabase
          .from('email_logs')
          .select('id')

        const qualifiedLeads = allLeads?.filter(
          (lead: { status: string }) => lead.status === 'qualified'
        ) || []

        setCampaigns(campaignsData || [])
        setStats({
          totalCampaigns: allCampaigns?.length || 0,
          totalLeads: allLeads?.length || 0,
          emailsSent: emailLogs?.length || 0,
          qualified: qualifiedLeads.length,
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Quick Actions */}
        <QuickActions />

        {/* Stats */}
        <DashboardStats stats={stats} loading={loading} />

        {/* Recent Campaigns */}
        <RecentCampaigns campaigns={campaigns} loading={loading} />
      </div>
    </DashboardLayout>
  )
}
