'use client'

import { useCallback, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Upload, Trash2 } from 'lucide-react'

interface Lead {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company: string | null
  status: string
  created_at: string
}

interface CampaignLeadsProps {
  campaignId: string
  leads: Lead[]
  onLeadsUpdate: () => void
}

export function CampaignLeads({
  campaignId,
  leads,
  onLeadsUpdate,
}: CampaignLeadsProps) {
  const [fileInput, setFileInput] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [manualEmail, setManualEmail] = useState('')
  const [manualName, setManualName] = useState('')

  const handleFileUpload = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        const text = await file.text()
        const lines = text.split('\n').filter((line) => line.trim())

        const supabase = createBrowserSupabaseClient()
        const leadsData = lines.map((line) => {
          const [email, firstName, lastName, company] = line.split(',')
          return {
            campaign_id: campaignId,
            email: email?.trim() || '',
            first_name: firstName?.trim() || null,
            last_name: lastName?.trim() || null,
            company: company?.trim() || null,
            status: 'not_sent',
          }
        })

        const { error } = await supabase.from('leads').insert(leadsData)

        if (error) throw error
        setFileInput(null)
        onLeadsUpdate()
      } catch (error) {
        console.error('Error uploading leads:', error)
        alert('Error uploading leads')
      } finally {
        setUploading(false)
      }
    },
    [campaignId, onLeadsUpdate]
  )

  const handleAddManualLead = async () => {
    if (!manualEmail) {
      alert('Please enter an email address')
      return
    }

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.from('leads').insert([
        {
          campaign_id: campaignId,
          email: manualEmail,
          first_name: manualName || null,
          status: 'not_sent',
        },
      ])

      if (error) throw error
      setManualEmail('')
      setManualName('')
      onLeadsUpdate()
    } catch (error) {
      console.error('Error adding lead:', error)
    }
  }

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.from('leads').delete().eq('id', leadId)

      if (error) throw error
      onLeadsUpdate()
    } catch (error) {
      console.error('Error deleting lead:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'opened':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'replied':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'qualified':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Add Leads</h3>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload CSV (Format: email, first_name, last_name, company)
            </label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => setFileInput(e.target.files?.[0] || null)}
              />
              <Button
                onClick={() => fileInput && handleFileUpload(fileInput)}
                disabled={!fileInput || uploading}
                className="gap-2"
              >
                <Upload className="size-4" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Each line: email,first_name,last_name,company
            </p>
          </div>

          {/* Manual Add */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-3">Or Add Manually</h4>
            <div className="space-y-2">
              <Input
                placeholder="email@example.com"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
              />
              <Input
                placeholder="First Name (optional)"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
              <Button
                onClick={handleAddManualLead}
                className="w-full"
              >
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <Card>
        {leads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No leads added yet
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>
                    {lead.first_name && lead.last_name
                      ? `${lead.first_name} ${lead.last_name}`
                      : lead.first_name || '-'}
                  </TableCell>
                  <TableCell>{lead.company || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLead(lead.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
