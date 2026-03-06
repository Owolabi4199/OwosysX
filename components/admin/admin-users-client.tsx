'use client'

import { useState } from 'react'
import { UserProfile } from '@/lib/admin-auth'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, Shield, UserCog } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase'

interface AdminUsersClientProps {
  initialUsers: UserProfile[]
}

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    setLoading(userId)
    try {
      const supabase = createBrowserSupabaseClient()
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ))
    } catch (error) {
      console.error('Error updating role:', error)
    } finally {
      setLoading(null)
    }
  }

  const updateUserTier = async (userId: string, newTier: string) => {
    setLoading(userId)
    try {
      const supabase = createBrowserSupabaseClient()
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ subscription_tier: newTier, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(u => 
        u.id === userId ? { ...u, subscription_tier: newTier } : u
      ))
    } catch (error) {
      console.error('Error updating tier:', error)
    } finally {
      setLoading(null)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive'
      case 'admin': return 'default'
      default: return 'secondary'
    }
  }

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'default'
      case 'pro': return 'default'
      case 'starter': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <Card>
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{user.full_name || 'No name'}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role === 'super_admin' ? 'Super Admin' : 
                   user.role === 'admin' ? 'Admin' : 'User'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getTierBadgeVariant(user.subscription_tier)}>
                  {user.subscription_tier}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.subscription_status === 'active' ? 'default' : 'destructive'}>
                  {user.subscription_status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      disabled={loading === user.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => updateUserRole(user.id, 'admin')}
                      disabled={user.role === 'admin'}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => updateUserRole(user.id, 'user')}
                      disabled={user.role === 'user'}
                    >
                      <UserCog className="mr-2 h-4 w-4" />
                      Make User
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => updateUserTier(user.id, 'pro')}
                      disabled={user.subscription_tier === 'pro'}
                    >
                      Upgrade to Pro
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => updateUserTier(user.id, 'free')}
                      disabled={user.subscription_tier === 'free'}
                    >
                      Reset to Free
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredUsers.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No users found
        </div>
      )}
    </Card>
  )
}
