import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createSubscriptionCheckout } from '@/lib/flutterwave'
import { getPlanBySlug } from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planSlug, billingCycle = 'monthly' } = body

    if (!planSlug) {
      return NextResponse.json({ error: 'Plan slug is required' }, { status: 400 })
    }

    // Get the plan
    const plan = await getPlanBySlug(planSlug)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Calculate amount
    const amount = billingCycle === 'yearly' 
      ? (plan.price_yearly || plan.price_monthly * 12) 
      : plan.price_monthly

    if (amount === 0) {
      // Free plan - just update the profile
      await supabase
        .from('user_profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      return NextResponse.json({
        success: true,
        message: 'Switched to free plan'
      })
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    // Create checkout
    const result = await createSubscriptionCheckout(
      user.id,
      user.email!,
      profile?.full_name || '',
      planSlug,
      plan.name,
      amount,
      billingCycle
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      paymentLink: result.paymentLink,
      txRef: result.txRef
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
