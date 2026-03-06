import { createServerSupabaseClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/subscription'
import {
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

async function getAdminStats() {
  const supabase = await createServerSupabaseClient()

  // Get total users
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  // Get users by tier
  const { data: tierData } = await supabase
    .from('user_profiles')
    .select('subscription_tier')

  const tierCounts = tierData?.reduce((acc: Record<string, number>, curr) => {
    acc[curr.subscription_tier] = (acc[curr.subscription_tier] || 0) + 1
    return acc
  }, {}) || {}

  // Get active subscriptions
  const { count: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Get revenue this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: monthlyPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'successful')
    .gte('created_at', startOfMonth.toISOString())

  const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // Get total revenue
  const { data: allPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'successful')

  const totalRevenue = allPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

  // Get recent payments
  const { data: recentPayments } = await supabase
    .from('payments')
    .select(`
      *,
      user_profiles:user_id (email, full_name)
    `)
    .eq('status', 'successful')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get new users this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { count: newUsersThisWeek } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString())

  return {
    totalUsers: totalUsers || 0,
    tierCounts,
    activeSubscriptions: activeSubscriptions || 0,
    monthlyRevenue,
    totalRevenue,
    recentPayments: recentPayments || [],
    newUsersThisWeek: newUsersThisWeek || 0
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newUsersThisWeek} this week`,
      changeType: 'positive' as const,
      icon: Users
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions.toLocaleString(),
      change: `${Math.round((stats.activeSubscriptions / Math.max(stats.totalUsers, 1)) * 100)}% conversion`,
      changeType: 'neutral' as const,
      icon: CreditCard
    },
    {
      title: 'Monthly Revenue',
      value: formatPrice(stats.monthlyRevenue),
      change: 'Current month',
      changeType: 'positive' as const,
      icon: TrendingUp
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      change: 'All time',
      changeType: 'neutral' as const,
      icon: DollarSign
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Platform overview and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <div className="mt-1 flex items-center text-xs">
                {stat.changeType === 'positive' && (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                )}
                {stat.changeType === 'negative' && (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={
                  stat.changeType === 'positive' ? 'text-green-500' :
                  stat.changeType === 'negative' ? 'text-red-500' :
                  'text-muted-foreground'
                }>
                  {stat.change}
                </span>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscription Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Subscription Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(stats.tierCounts).map(([tier, count]) => {
              const percentage = Math.round((count / Math.max(stats.totalUsers, 1)) * 100)
              return (
                <div key={tier}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium capitalize">{tier}</span>
                    <span className="text-muted-foreground">{count} users ({percentage}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Recent Payments */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
          {stats.recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet</p>
          ) : (
            <div className="space-y-4">
              {stats.recentPayments.map((payment: {
                id: string
                amount: number
                currency: string
                created_at: string
                user_profiles: { email: string; full_name: string | null } | null
              }) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {payment.user_profiles?.full_name || payment.user_profiles?.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-semibold text-green-600">
                    +{formatPrice(payment.amount, payment.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
