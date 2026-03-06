'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase-client'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { CampaignsList } from './campaigns-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
}

export function CampaignsContent({ user }: { user: User }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setCampaigns(data || [])
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your cold email campaigns
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/campaigns/new">
              <Plus className="size-4" />
              New Campaign
            </Link>
          </Button>
        </div>

        <CampaignsList campaigns={campaigns} loading={loading} />
      </div>
    </DashboardLayout>
  )
}
