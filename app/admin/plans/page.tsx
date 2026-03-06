import { createServerSupabaseClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/subscription'
import { Check, X } from 'lucide-react'

async function getPlans() {
  const supabase = await createServerSupabaseClient()

  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('sort_order')

  return plans || []
}

export default async function AdminPlansPage() {
  const plans = await getPlans()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="mt-1 text-muted-foreground">
          Manage and configure subscription tiers
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan: {
          id: string
          name: string
          slug: string
          price_monthly: number
          price_yearly: number | null
          currency: string
          features: Record<string, boolean>
          limits: Record<string, number>
          is_active: boolean
        }) => (
          <Card key={plan.id} className={`p-6 ${!plan.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                {plan.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold">
                {plan.price_monthly === 0 ? 'Free' : formatPrice(plan.price_monthly)}
              </span>
              {plan.price_monthly > 0 && (
                <span className="text-muted-foreground">/month</span>
              )}
              {plan.price_yearly && plan.price_yearly > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPrice(plan.price_yearly)}/year
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Limits</h4>
                <ul className="text-sm space-y-1">
                  {Object.entries(plan.limits).map(([key, value]) => (
                    <li key={key} className="flex justify-between text-muted-foreground">
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-foreground">
                        {value === -1 ? 'Unlimited' : value.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Features</h4>
                <ul className="text-sm space-y-1">
                  {Object.entries(plan.features).map(([feature, enabled]) => (
                    <li key={feature} className="flex items-center gap-2">
                      {enabled ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={enabled ? '' : 'text-muted-foreground'}>
                        {feature.replace(/_/g, ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Plan Configuration</h3>
        <p className="text-muted-foreground">
          To modify plans, use the Supabase dashboard or create a migration. 
          Plans are stored in the <code className="bg-muted px-1 rounded">subscription_plans</code> table.
        </p>
      </Card>
    </div>
  )
}
