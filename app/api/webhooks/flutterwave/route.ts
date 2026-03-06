import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, verifyTransaction } from '@/lib/flutterwave'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('verif-hash') || ''

    // Verify webhook signature
    const isValid = verifyWebhookSignature(payload, signature)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(payload)

    // Handle charge.completed event
    if (event.event === 'charge.completed' && event.data.status === 'successful') {
      const transactionId = event.data.id

      // Verify the transaction
      const verification = await verifyTransaction(transactionId.toString())
      
      if (verification.status !== 'success' || verification.data.status !== 'successful') {
        console.error('Transaction verification failed:', verification)
        return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
      }

      const transaction = verification.data
      const meta = transaction.meta || {}

      if (!meta.user_id || !meta.plan_slug) {
        console.error('Missing meta data in transaction:', meta)
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      const supabase = await createServerSupabaseClient()

      // Get the plan
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('slug', meta.plan_slug)
        .single()

      if (!plan) {
        console.error('Plan not found:', meta.plan_slug)
        return NextResponse.json({ error: 'Plan not found' }, { status: 400 })
      }

      // Calculate period dates
      const periodStart = new Date()
      const periodEnd = new Date()
      
      if (meta.billing_cycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      }

      // Create or update subscription
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', meta.user_id)
        .eq('status', 'active')
        .single()

      if (existingSub) {
        // Update existing subscription
        await supabase
          .from('subscriptions')
          .update({
            plan_id: plan.id,
            status: 'active',
            billing_cycle: meta.billing_cycle,
            flutterwave_transaction_ref: transaction.tx_ref,
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSub.id)
      } else {
        // Create new subscription
        await supabase.from('subscriptions').insert({
          user_id: meta.user_id,
          plan_id: plan.id,
          status: 'active',
          billing_cycle: meta.billing_cycle,
          flutterwave_transaction_ref: transaction.tx_ref,
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString()
        })
      }

      // Record the payment
      await supabase.from('payments').insert({
        user_id: meta.user_id,
        flutterwave_tx_id: transaction.id.toString(),
        flutterwave_tx_ref: transaction.tx_ref,
        amount: transaction.amount,
        currency: transaction.currency,
        status: 'successful',
        payment_type: meta.subscription_type === 'upgrade' ? 'upgrade' : 'subscription',
        metadata: {
          plan_slug: meta.plan_slug,
          billing_cycle: meta.billing_cycle,
          flw_ref: transaction.flw_ref
        }
      })

      // Update user profile
      await supabase
        .from('user_profiles')
        .update({
          subscription_tier: meta.plan_slug,
          subscription_status: 'active',
          current_period_start: periodStart.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', meta.user_id)

      console.log('Subscription activated for user:', meta.user_id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
