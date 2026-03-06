import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-utils'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Settings - ColdEmail Pro',
  description: 'Manage your account settings',
}

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account and workspace settings
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">SMTP Configuration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure your email server settings for sending campaigns
            </p>
            <Button asChild>
              <Link href="/settings/smtp">Configure SMTP</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2">Automation Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure automated workflows and reply detection
            </p>
            <Button asChild>
              <Link href="/settings/automation">Configure Automation</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2">Workspace Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage workspace name and members
            </p>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2">API Keys</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage API keys for integrations
            </p>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
