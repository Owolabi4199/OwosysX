'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, ArrowLeft } from 'lucide-react'

interface CampaignWizardProps {
  user: User
}

type Step = 'basics' | 'sequences' | 'leads' | 'review'

interface CampaignData {
  name: string
  description: string
  sequences: Array<{
    order: number
    subject: string
    body: string
    delayHours: number
  }>
}

export function CampaignWizard({ user }: CampaignWizardProps) {
  const [step, setStep] = useState<Step>('basics')
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    description: '',
    sequences: [
      { order: 1, subject: '', body: '', delayHours: 0 },
      { order: 2, subject: '', body: '', delayHours: 24 },
      { order: 3, subject: '', body: '', delayHours: 72 },
    ],
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBasicsChange = (field: string, value: string) => {
    setCampaignData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSequenceChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setCampaignData((prev) => ({
      ...prev,
      sequences: prev.sequences.map((seq, i) =>
        i === index ? { ...seq, [field]: value } : seq
      ),
    }))
  }

  const addSequence = () => {
    setCampaignData((prev) => ({
      ...prev,
      sequences: [
        ...prev.sequences,
        {
          order: prev.sequences.length + 1,
          subject: '',
          body: '',
          delayHours: 0,
        },
      ],
    }))
  }

  const removeSequence = (index: number) => {
    if (campaignData.sequences.length > 1) {
      setCampaignData((prev) => ({
        ...prev,
        sequences: prev.sequences.filter((_, i) => i !== index),
      }))
    }
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      const supabase = createBrowserSupabaseClient()

      // Get workspace
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .limit(1)
        .single()

      if (!workspace) throw new Error('Workspace not found')

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert([
          {
            workspace_id: workspace.id,
            name: campaignData.name,
            description: campaignData.description,
            status: 'draft',
          },
        ])
        .select()
        .single()

      if (campaignError) throw campaignError

      // Create email sequences
      const sequencesData = campaignData.sequences.map((seq) => ({
        campaign_id: campaign.id,
        order_number: seq.order,
        subject: seq.subject,
        body: seq.body,
        delay_hours: seq.delayHours,
      }))

      const { error: sequencesError } = await supabase
        .from('email_sequences')
        .insert(sequencesData)

      if (sequencesError) throw sequencesError

      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      console.error('Error creating campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground">
            Set up your cold email campaign in 4 steps
          </p>
        </div>

        <Card className="p-8">
          <Tabs value={step} onValueChange={(v) => setStep(v as Step)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="sequences">Sequences</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            {/* Step 1: Basics */}
            <TabsContent value="basics" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Campaign Name
                  </label>
                  <Input
                    placeholder="e.g., Q1 Tech Company Outreach"
                    value={campaignData.name}
                    onChange={(e) => handleBasicsChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description (optional)
                  </label>
                  <Textarea
                    placeholder="Describe the goal of this campaign"
                    value={campaignData.description}
                    onChange={(e) =>
                      handleBasicsChange('description', e.target.value)
                    }
                  />
                </div>
              </div>
            </TabsContent>

            {/* Step 2: Email Sequences */}
            <TabsContent value="sequences" className="space-y-6">
              {campaignData.sequences.map((seq, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Email {seq.order}</h3>
                    {campaignData.sequences.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSequence(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Subject Line
                    </label>
                    <Input
                      placeholder="Email subject"
                      value={seq.subject}
                      onChange={(e) =>
                        handleSequenceChange(index, 'subject', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Body
                    </label>
                    <Textarea
                      placeholder="Email content"
                      rows={6}
                      value={seq.body}
                      onChange={(e) =>
                        handleSequenceChange(index, 'body', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Delay (hours) - Send this email X hours after the previous one
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={seq.delayHours}
                      onChange={(e) =>
                        handleSequenceChange(
                          index,
                          'delayHours',
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>
              ))}

              <Button onClick={addSequence} variant="outline" className="w-full">
                Add Sequence
              </Button>
            </TabsContent>

            {/* Step 3: Leads */}
            <TabsContent value="leads" className="space-y-4">
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">
                  You can upload leads after creating the campaign
                </p>
              </div>
            </TabsContent>

            {/* Step 4: Review */}
            <TabsContent value="review" className="space-y-4">
              <div className="space-y-4 rounded-lg bg-muted p-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Campaign Name
                  </p>
                  <p className="text-lg font-semibold">
                    {campaignData.name || '(Not set)'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email Sequences
                  </p>
                  <p className="text-lg font-semibold">
                    {campaignData.sequences.length} emails
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                const steps: Step[] = ['basics', 'sequences', 'leads', 'review']
                const currentIndex = steps.indexOf(step)
                if (currentIndex > 0) {
                  setStep(steps[currentIndex - 1])
                }
              }}
              disabled={step === 'basics'}
            >
              <ArrowLeft className="mr-2 size-4" />
              Previous
            </Button>

            {step === 'review' ? (
              <Button
                onClick={handleCreate}
                disabled={
                  !campaignData.name ||
                  campaignData.sequences.some((s) => !s.subject || !s.body) ||
                  loading
                }
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  const steps: Step[] = ['basics', 'sequences', 'leads', 'review']
                  const currentIndex = steps.indexOf(step)
                  if (currentIndex < steps.length - 1) {
                    setStep(steps[currentIndex + 1])
                  }
                }}
              >
                Next
                <ArrowRight className="ml-2 size-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
