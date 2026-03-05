'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Mail, Plus, Trash2 } from 'lucide-react'

interface SMTPCredential {
  id: string
  email: string
  smtp_host: string
  smtp_port: number
  smtp_user: string
  is_active: boolean
  created_at: string
}

interface SMTPSettingsProps {
  user: User
}

export function SMTPSettings({ user }: SMTPSettingsProps) {
  const [credentials, setCredentials] = useState<SMTPCredential[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data, error } = await supabase
        .from('smtp_credentials')
        .select('id, email, smtp_host, smtp_port, smtp_user, is_active, created_at')

      if (error) throw error
      setCredentials(data || [])
    } catch (error) {
      console.error('Error fetching SMTP credentials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (
      !formData.email ||
      !formData.smtpHost ||
      !formData.smtpUser ||
      !formData.smtpPassword
    ) {
      alert('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const supabase = createBrowserSupabaseClient()

      // Get workspace
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .limit(1)
        .single()

      if (!workspace) throw new Error('Workspace not found')

      // In a real app, you'd encrypt the password on the server
      // For now, we'll just store it (NOT RECOMMENDED for production)
      const { error } = await supabase.from('smtp_credentials').insert([
        {
          workspace_id: workspace.id,
          email: formData.email,
          smtp_host: formData.smtpHost,
          smtp_port: parseInt(formData.smtpPort),
          smtp_user: formData.smtpUser,
          smtp_password_encrypted: formData.smtpPassword, // Should be encrypted
          is_active: true,
        },
      ])

      if (error) throw error

      setFormData({
        email: '',
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
        smtpPassword: '',
      })
      setShowForm(false)
      await fetchCredentials()
    } catch (error) {
      console.error('Error saving SMTP credentials:', error)
      alert('Error saving credentials')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SMTP credential?')) return

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase
        .from('smtp_credentials')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchCredentials()
    } catch (error) {
      console.error('Error deleting credential:', error)
    }
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">SMTP Configuration</h1>
          <p className="mt-1 text-muted-foreground">
            Configure your email server settings for sending campaigns
          </p>
        </div>

        {/* Current Credentials */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active SMTP Accounts</h2>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : credentials.length === 0 ? (
            <Card className="p-8 text-center">
              <Mail className="mx-auto mb-4 size-8 text-muted-foreground" />
              <p className="text-muted-foreground">No SMTP accounts configured yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {credentials.map((cred) => (
                <Card key={cred.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{cred.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {cred.smtp_host}:{cred.smtp_port}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {cred.is_active && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cred.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add New SMTP */}
        <div>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="size-4" />
              Add SMTP Account
            </Button>
          ) : (
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Add New SMTP Account</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    placeholder="noreply@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">SMTP Host</label>
                  <Input
                    placeholder="smtp.gmail.com"
                    value={formData.smtpHost}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        smtpHost: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Port</label>
                    <Input
                      type="number"
                      placeholder="587"
                      value={formData.smtpPort}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          smtpPort: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <Input
                      placeholder="your@email.com"
                      value={formData.smtpUser}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          smtpUser: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.smtpPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        smtpPassword: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Saving...' : 'Save Account'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
