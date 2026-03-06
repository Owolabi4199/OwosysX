import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface SendEmailRequest {
  leadId: string
  sequenceId: string
  campaignId: string
  email: string
  subject: string
  body: string
  fromEmail: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json() as SendEmailRequest
    const { id: campaignId } = await params

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get SMTP credentials
    const { data: smtpCreds, error: smtpError } = await supabase
      .from('smtp_credentials')
      .select('*')
      .eq('email', body.fromEmail)
      .single()

    if (smtpError || !smtpCreds) {
      return NextResponse.json(
        { error: 'SMTP credentials not found' },
        { status: 400 }
      )
    }

    // Create transporter (NOTE: In production, decrypt the password from a secure vault)
    const transporter = nodemailer.createTransport({
      host: smtpCreds.smtp_host,
      port: smtpCreds.smtp_port,
      secure: smtpCreds.smtp_port === 465,
      auth: {
        user: smtpCreds.smtp_user,
        pass: smtpCreds.smtp_password_encrypted, // Should be decrypted from vault
      },
    })

    // Generate tracking token
    const trackingToken = `${body.leadId}-${body.sequenceId}-${Date.now()}`

    // Add tracking pixel to email
    const emailBody = `${body.body}\n\n<!-- Tracking pixel -->\n<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/track/${trackingToken}" width="1" height="1" />`

    // Send email
    await transporter.sendMail({
      from: body.fromEmail,
      to: body.email,
      subject: body.subject,
      html: emailBody,
    })

    // Log email send
    const { error: logError } = await supabase.from('email_logs').insert([
      {
        lead_id: body.leadId,
        sequence_id: body.sequenceId,
        campaign_id: body.campaignId,
        tracking_token: trackingToken,
      },
    ])

    if (logError) {
      console.error('Error logging email:', logError)
    }

    // Update lead status
    await supabase
      .from('leads')
      .update({ status: 'sent' })
      .eq('id', body.leadId)

    return NextResponse.json({ success: true, trackingToken })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
