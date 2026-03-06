import { createServerSupabaseClient } from '@/lib/supabase'

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_yearly: number | null
  currency: string
  features: Record<string, boolean>
  limits: {
    campaigns: number
    leads_per_campaign: number
    emails_per_month: number
    sequences_per_campaign: number
    team_members: number
  }
  is_active: boolean
  sort_order: number
}

export interface UserUsage {
  campaigns_created: number
  leads_added: number
  emails_sent: number
}

export interface UsageLimitCheck {
  allowed: boolean
  current: number
  limit: number
  limitName: string
}

// Get all active subscription plans
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.error('Error fetching plans:', error)
    return []
  }

  return data as SubscriptionPlan[]
}

// Get a specific plan by slug
export async function getPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
  const supabase = await createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    return null
  }

  return data as SubscriptionPlan
}

// Get user's current usage for the billing period
export async function getUserUsage(userId: string): Promise<UserUsage> {
  const supabase = await createServerSupabaseClient()
  
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const { data } = await supabase
    .from('usage_records')
    .select('*')
    .eq('user_id', userId)
    .eq('period_start', periodStart.toISOString().split('T')[0])
    .single()

  return {
    campaigns_created: data?.campaigns_created || 0,
    leads_added: data?.leads_added || 0,
    emails_sent: data?.emails_sent || 0
  }
}

// Check if user can perform an action based on their plan limits
export async function checkUsageLimit(
  userId: string,
  limitType: 'campaigns' | 'leads' | 'emails',
  additionalCount: number = 1
): Promise<UsageLimitCheck> {
  const supabase = await createServerSupabaseClient()
  
  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const tier = profile?.subscription_tier || 'free'
  
  // Get the plan limits
  const plan = await getPlanBySlug(tier)
  if (!plan) {
    return { allowed: false, current: 0, limit: 0, limitName: 'Unknown plan' }
  }

  // Get current usage
  const usage = await getUserUsage(userId)

  let current = 0
  let limit = 0
  let limitName = ''

  switch (limitType) {
    case 'campaigns':
      current = usage.campaigns_created
      limit = plan.limits.campaigns
      limitName = 'campaigns'
      break
    case 'leads':
      current = usage.leads_added
      limit = plan.limits.leads_per_campaign
      limitName = 'leads'
      break
    case 'emails':
      current = usage.emails_sent
      limit = plan.limits.emails_per_month
      limitName = 'emails per month'
      break
  }

  // -1 means unlimited
  const allowed = limit === -1 || (current + additionalCount) <= limit

  return { allowed, current, limit, limitName }
}

// Increment usage counter
export async function incrementUsage(
  userId: string,
  type: 'campaigns' | 'leads' | 'emails',
  count: number = 1
) {
  const supabase = await createServerSupabaseClient()
  
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Check if record exists
  const { data: existing } = await supabase
    .from('usage_records')
    .select('id')
    .eq('user_id', userId)
    .eq('period_start', periodStart.toISOString().split('T')[0])
    .single()

  const columnMap = {
    campaigns: 'campaigns_created',
    leads: 'leads_added',
    emails: 'emails_sent'
  }

  if (existing) {
    // Update existing record
    await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_period_start: periodStart.toISOString().split('T')[0],
      p_column: columnMap[type],
      p_amount: count
    })
  } else {
    // Create new record
    const insertData: Record<string, unknown> = {
      user_id: userId,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      [columnMap[type]]: count
    }
    
    await supabase.from('usage_records').insert(insertData)
  }
}

// Check if user has access to a feature
export async function hasFeatureAccess(
  userId: string,
  feature: string
): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const tier = profile?.subscription_tier || 'free'
  const plan = await getPlanBySlug(tier)

  if (!plan) return false

  return plan.features[feature] === true
}

// Format price for display
export function formatPrice(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount)
}
