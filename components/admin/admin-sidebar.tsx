'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserProfile } from '@/lib/admin-auth'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  BarChart3,
  FileText,
  Shield,
  ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminSidebarProps {
  profile: UserProfile
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { label: 'Revenue', href: '/admin/revenue', icon: BarChart3 },
    { label: 'Plans', href: '/admin/plans', icon: FileText },
    { label: 'Audit Log', href: '/admin/audit', icon: Shield },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-semibold">Admin Panel</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Logged in as</p>
          <p className="text-sm font-medium truncate">{profile.email}</p>
          <p className="text-xs text-muted-foreground capitalize">{profile.role.replace('_', ' ')}</p>
        </div>
        
        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to App
          </Link>
        </Button>
      </div>
    </div>
  )
}
