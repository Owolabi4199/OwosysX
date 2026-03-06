import { createServerSupabaseClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/subscription'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

async function getRevenueData() {
  const supabase = await createServerSupabaseClient()

  // Get all payments
  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      user_profiles:user_id (email, full_name)
    `)
    .order('created_at', { ascending: false })

  // Calculate monthly revenue for the last 6 months
  const monthlyRevenue: { month: string; revenue: number }[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    
    const monthPayments = payments?.filter(p => {
      const paymentDate = new Date(p.created_at)
      return p.status === 'successful' &&
        paymentDate >= monthStart &&
        paymentDate <= monthEnd
    }) || []

    const revenue = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0)

    monthlyRevenue.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue
    })
  }

  // Calculate totals
  const successfulPayments = payments?.filter(p => p.status === 'successful') || []
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const currentMonthRevenue = monthlyRevenue[5]?.revenue || 0
  const lastMonthRevenue = monthlyRevenue[4]?.revenue || 0
  
  const growthRate = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : '0'

  return {
    payments: payments || [],
    monthlyRevenue,
    totalRevenue,
    currentMonthRevenue,
    growthRate,
    transactionCount: successfulPayments.length
  }
}

export default async function AdminRevenuePage() {
  const data = await getRevenueData()
  const maxRevenue = Math.max(...data.monthlyRevenue.map(m => m.revenue), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revenue</h1>
        <p className="mt-1 text-muted-foreground">
          Track payments and revenue metrics
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold">{formatPrice(data.totalRevenue)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">This Month</p>
          <p className="mt-2 text-2xl font-bold">{formatPrice(data.currentMonthRevenue)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
          <p className="mt-2 text-2xl font-bold">{data.growthRate}%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Transactions</p>
          <p className="mt-2 text-2xl font-bold">{data.transactionCount}</p>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Monthly Revenue</h3>
        <div className="flex items-end gap-2 h-48">
          {data.monthlyRevenue.map((month) => (
            <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex justify-center">
                <span className="text-xs text-muted-foreground">
                  {formatPrice(month.revenue)}
                </span>
              </div>
              <div 
                className="w-full bg-primary rounded-t transition-all"
                style={{ 
                  height: `${(month.revenue / maxRevenue) * 150}px`,
                  minHeight: month.revenue > 0 ? '8px' : '0px'
                }}
              />
              <span className="text-xs text-muted-foreground">{month.month}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">All Transactions</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No transactions yet
                </TableCell>
              </TableRow>
            ) : (
              data.payments.map((payment: {
                id: string
                created_at: string
                user_profiles: { email: string; full_name: string | null } | null
                payment_type: string
                amount: number
                currency: string
                status: string
                flutterwave_tx_ref: string | null
              }) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {new Date(payment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {payment.user_profiles?.full_name || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.user_profiles?.email || 'Unknown'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {payment.payment_type?.replace('_', ' ') || 'subscription'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.status === 'successful' ? 'default' : 'destructive'}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {payment.flutterwave_tx_ref?.slice(0, 20) || '-'}...
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
