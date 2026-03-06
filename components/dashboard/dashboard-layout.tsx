'use client'

import { ReactNode, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

interface DashboardLayoutProps {
  user: User
  children: ReactNode
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Campaigns', href: '/campaigns' },
    { label: 'Leads', href: '/leads' },
    { label: 'Replies', href: '/replies' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Billing', href: '/billing' },
    { label: 'Settings', href: '/settings' },
  ]

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      {/* Mobile menu button */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3 lg:hidden">
        <h1 className="font-bold text-lg">ColdEmail Pro</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-muted-foreground hover:text-foreground"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`absolute inset-y-0 left-0 z-40 w-64 transform border-r bg-background transition-transform duration-200 ease-in-out lg:relative lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="hidden items-center gap-2 border-b px-6 py-4 lg:flex">
            <div className="size-8 rounded-md bg-primary" />
            <span className="font-bold">ColdEmail Pro</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <div className="flex items-center gap-2 truncate">
                    <div className="size-8 rounded-full bg-primary" />
                    <div className="truncate text-left">
                      <p className="text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/admin">Admin Panel</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
