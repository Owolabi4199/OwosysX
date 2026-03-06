'use client'

import { User } from '@supabase/supabase-js'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, AlertCircle, Zap } from 'lucide-react'

interface AutomationSettingsProps {
  user: User
}

const automationFeatures = [
  {
    id: 'reply-detection',
    name: 'Automatic Reply Detection',
    description: 'Automatically detect replies and categorize them',
    icon: CheckCircle2,
    status: 'available',
  },
  {
    id: 'follow-up-sequence',
    name: 'Follow-up Sequence Automation',
    description: 'Automatically send follow-up emails based on delays',
    icon: Zap,
    status: 'available',
  },
  {
    id: 'reply-categorization',
    name: 'Smart Reply Categorization',
    description: 'AI-powered categorization of replies (interested, not interested, etc)',
    icon: AlertCircle,
    status: 'coming',
  },
  {
    id: 'lead-qualification',
    name: 'Automatic Lead Qualification',
    description: 'Automatically mark leads as qualified based on engagement',
    icon: CheckCircle2,
    status: 'coming',
  },
]

const replyCategories = [
  { value: 'interested', label: 'Interested', color: 'bg-green-100 text-green-800' },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-red-100 text-red-800' },
  { value: 'out_of_office', label: 'Out of Office', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'spam', label: 'Spam', color: 'bg-gray-100 text-gray-800' },
  { value: 'other', label: 'Other', color: 'bg-blue-100 text-blue-800' },
]

export function AutomationSettings({ user }: AutomationSettingsProps) {
  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Automation Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Configure automated workflows and reply detection
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Automation Features</h2>
          <div className="grid gap-4">
            {automationFeatures.map((feature) => {
              const Icon = feature.icon
              const isAvailable = feature.status === 'available'
              return (
                <Card key={feature.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`size-5 ${
                            isAvailable ? 'text-green-600' : 'text-gray-400'
                          }`}
                        />
                        <h3 className="font-semibold">{feature.name}</h3>
                        {!isAvailable && (
                          <Badge variant="outline" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    {isAvailable && (
                      <div className="ml-4">
                        <Switch defaultChecked disabled={!isAvailable} />
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Reply Categories */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Reply Categories</h2>
          <p className="text-sm text-muted-foreground">
            Configure how your system categorizes incoming replies
          </p>

          <div className="grid gap-3">
            {replyCategories.map((category) => (
              <Card key={category.value} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{category.label}</p>
                    <p className="text-sm text-muted-foreground">
                      Replies will be marked as {category.label.toLowerCase()}
                    </p>
                  </div>
                  <Badge className={category.color}>{category.label}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Follow-up Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Follow-up Email Rules</h2>
          <p className="text-sm text-muted-foreground">
            Define rules for automatic follow-up sequences
          </p>

          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Stop follow-ups if reply received?</Label>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <span className="text-sm text-muted-foreground">
                  Automatically pause follow-ups when a reply is detected
                </span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <Label>Pause follow-ups for qualified leads</Label>
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <span className="text-sm text-muted-foreground">
                  Stop sending emails once a lead is marked qualified
                </span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <Label>Maximum follow-ups per lead</Label>
              <Select defaultValue="3">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 email only</SelectItem>
                  <SelectItem value="2">2 follow-ups</SelectItem>
                  <SelectItem value="3">3 follow-ups</SelectItem>
                  <SelectItem value="5">5 follow-ups</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <div>
          <Button disabled>Save Settings</Button>
          <p className="mt-2 text-sm text-muted-foreground">
            Automation features will be available in the next update
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
