'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Zap } from 'lucide-react'

export function QuickActions() {
  const router = useRouter()

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Get Started</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first campaign to start sending cold emails
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/campaigns/new')}
            className="gap-2"
          >
            <Plus className="size-4" />
            New Campaign
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/settings/smtp')}
            className="gap-2"
          >
            <Zap className="size-4" />
            Configure SMTP
          </Button>
        </div>
      </div>
    </Card>
  )
}
