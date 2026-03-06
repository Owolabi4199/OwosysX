'use client'

import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-client'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/subscription'
import { Check, Zap, Crown, Building2 } from 'lucide-react'

interface BillingContentProps {
  userId: string
  userEmail: string
}

interface Plan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number | null
  features: Record<string, boolean>
  limits: Record<string, number>
}

interface UserProfile {
  subscription_tier: string
  subscription_status: string
  current_period_end: string | null
}

export function BillingContent({ userId, userEmail }: BillingContentProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createBrowserSupabaseClient()

      // Fetch plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('subscription_tier, subscription_status, current_period_end')
        .eq('id', userId)
        .single()

      setPlans(plansData || [])
      setProfile(profileData)
      setLoading(false)
    }

    fetchData()
  }, [userId])

  const handleCheckout = async (planSlug: string) => {
    if (planSlug === profile?.subscription_tier) return

    setCheckoutLoading(planSlug)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug, billingCycle })
      })

      const data = await response.json()

      if (data.success && data.paymentLink) {
        window.location.href = data.paymentLink
      } else if (data.success) {
        // Free plan - just reload
        window.location.reload()
      } else {
        console.error('Checkout error:', data.error)
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setCheckoutLoading(null)
    }
  }

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'starter': return <Zap className="h-5 w-5" />
      case 'pro': return <Crown className="h-5 w-5" />
      case 'enterprise': return <Building2 className="h-5 w-5" />
      default: return null
    }
  }

  const user = { id: userId, email: userEmail }

  if (loading) {
    return (
      <DashboardLayout user={user as never}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user as never}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Billing & Plans</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your subscription and billing details
          </p>
        </div>

        {/* Current Plan */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
              <p className="mt-1 text-2xl font-bold capitalize">{profile?.subscription_tier || 'Free'}</p>
              {profile?.current_period_end && (
                <p className="text-sm text-muted-foreground mt-1">
                  Renews on {new Date(profile.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            <Badge variant={profile?.subscription_status === 'active' ? 'default' : 'destructive'}>
              {profile?.subscription_status || 'active'}
            </Badge>
          </div>
        </Card>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'outline'}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
            <Badge variant="secondary" className="ml-2">Save 17%</Badge>
          </Button>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrentPlan = plan.slug === profile?.subscription_tier
            const price = billingCycle === 'yearly' 
              ? (plan.price_yearly || plan.price_monthly * 10)
              : plan.price_monthly

            return (
              <Card 
                key={plan.id} 
                className={`p-6 flex flex-col ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  {getPlanIcon(plan.slug)}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  {isCurrentPlan && (
                    <Badge variant="secondary" className="ml-auto">Current</Badge>
                  )}
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold">
                    {price === 0 ? 'Free' : formatPrice(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-muted-foreground">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>
                      {plan.limits.campaigns === -1 
                        ? 'Unlimited campaigns' 
                        : `${plan.limits.campaigns} campaigns`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>
                      {plan.limits.leads_per_campaign === -1 
                        ? 'Unlimited leads' 
                        : `${plan.limits.leads_per_campaign.toLocaleString()} leads/campaign`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>
                      {plan.limits.emails_per_month === -1 
                        ? 'Unlimited emails' 
                        : `${plan.limits.emails_per_month.toLocaleString()} emails/month`}
                    </span>
                  </li>
                  {plan.features.priority_support && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Priority support</span>
                    </li>
                  )}
                  {plan.features.automation && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Advanced automation</span>
                    </li>
                  )}
                  {plan.features.api_access && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>API access</span>
                    </li>
                  )}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan || checkoutLoading !== null}
                  onClick={() => handleCheckout(plan.slug)}
                >
                  {checkoutLoading === plan.slug 
                    ? 'Processing...'
                    : isCurrentPlan 
                      ? 'Current Plan' 
                      : price === 0 
                        ? 'Downgrade'
                        : 'Upgrade'}
                </Button>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
