import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

interface SendCampaignRequest {
  fromEmail: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json() as SendCampaignRequest
    const { id: campaignId } = await params

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get campaign and verify ownership through workspace
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*, workspaces(owner_id)')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify that the user owns the workspace that owns this campaign
    const workspace = (campaign as any).workspaces
    if (!workspace || workspace.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not have access to this campaign' },
        { status: 403 }
      )
    }

    // Get all sequences
    const { data: sequences, error: sequencesError } = await supabase
      .from('email_sequences')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('order_number')

    if (sequencesError || !sequences || sequences.length === 0) {
      return NextResponse.json(
        { error: 'No email sequences found' },
        { status: 400 }
      )
    }

    // Get all leads that haven't been sent to
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'not_sent')

    if (leadsError || !leads) {
      return NextResponse.json(
        { error: 'Error fetching leads' },
        { status: 400 }
      )
    }

    if (leads.length === 0) {
      return NextResponse.json(
        { error: 'No leads to send to' },
        { status: 400 }
      )
    }

    // Update campaign status to active
    await supabase
      .from('campaigns')
      .update({ status: 'active' })
      .eq('id', campaignId)

    // Create scheduled jobs for first email in sequence
    // In production, you'd use a job queue like Bull or Bee-Queue
    const firstSequence = sequences[0]
    
    for (const lead of leads) {
      const trackingToken = `${lead.id}-${firstSequence.id}-${Date.now()}`

      // Update lead status to sent for first email
      await supabase
        .from('leads')
        .update({ status: 'sent' })
        .eq('id', lead.id)

      // Log email send
      await supabase.from('email_logs').insert([
        {
          lead_id: lead.id,
          sequence_id: firstSequence.id,
          campaign_id: campaignId,
          tracking_token: trackingToken,
        },
      ])

      // In production, schedule follow-up emails based on delay_hours
      // For now, they would be triggered by a separate job scheduler
    }

    return NextResponse.json({
      success: true,
      message: `Campaign started. ${leads.length} emails queued.`,
      leadsCount: leads.length,
    })
  } catch (error) {
    console.error('Error sending campaign:', error)
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    )
  }
}
