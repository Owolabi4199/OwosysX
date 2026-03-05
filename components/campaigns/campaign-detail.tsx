'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { CampaignLeads } from './campaign-leads'
import { CampaignAnalytics } from './campaign-analytics'
import { Mail, Settings, BarChart3 } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
}

interface EmailSequence {
  id: string
  order_number: number
  subject: string
  body: string
  delay_hours: number
}

interface Lead {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company: string | null
  status: string
  created_at: string
}

interface CampaignDetailProps {
  campaignId: string
  user: User
}

export function CampaignDetail({ campaignId, user }: CampaignDetailProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [sequences, setSequences] = useState<EmailSequence[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCampaignData = async () => {
    try {
      const supabase = createBrowserSupabaseClient()

      // Fetch campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single()

      if (campaignError) throw campaignError

      // Fetch sequences
      const { data: sequencesData, error: sequencesError } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('order_number')

      if (sequencesError) throw sequencesError

      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('campaign_id', campaignId)

      if (leadsError) throw leadsError

      setCampaign(campaignData)
      setSequences(sequencesData || [])
      setLeads(leadsData || [])
    } catch (error) {
      console.error('Error fetching campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaignData()
  }, [campaignId])

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
      <DashboardLayout user={user}>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!campaign) {
    return (
      <DashboardLayout user={user}>
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          Campaign not found
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              {campaign.description && (
                <p className="mt-1 text-muted-foreground">{campaign.description}</p>
              )}
            </div>
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button className="gap-2">
              <Mail className="size-4" />
              Configure Leads
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="size-4" />
              Settings
            </Button>
            <Button variant="outline" className="gap-2">
              <BarChart3 className="size-4" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sequences" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sequences">Email Sequences</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Sequences Tab */}
          <TabsContent value="sequences" className="space-y-4">
            {sequences.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No email sequences configured
              </Card>
            ) : (
              sequences.map((sequence, index) => (
                <Card key={sequence.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold">
                        Email {sequence.order_number}
                        {sequence.delay_hours > 0 && (
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            (Send after {sequence.delay_hours} hours)
                          </span>
                        )}
                      </h3>
                      <p className="font-medium">{sequence.subject}</p>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {sequence.body}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <CampaignLeads 
              campaignId={campaignId} 
              leads={leads}
              onLeadsUpdate={fetchCampaignData}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <CampaignAnalytics campaignId={campaignId} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
