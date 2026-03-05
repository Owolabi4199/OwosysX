import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Mail, Zap, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="size-8 rounded-md bg-primary" />
            ColdEmail Pro
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-24 text-center sm:py-32">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold sm:text-6xl">
              Cold Email Automation for Agencies
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Build simple, automated cold email systems that bring in qualified calls.
              Set it up in minutes, not weeks.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup" className="gap-2">
                Start Free Trial <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            No credit card required. Free for 14 days.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground">
              Build and manage cold email campaigns with powerful automation
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Campaign Builder */}
            <div className="space-y-4 rounded-lg border p-6">
              <Mail className="size-8 text-primary" />
              <h3 className="font-semibold text-lg">Campaign Builder</h3>
              <p className="text-muted-foreground">
                Create multi-step email sequences with custom delays and personalization tokens.
              </p>
            </div>

            {/* Automation */}
            <div className="space-y-4 rounded-lg border p-6">
              <Zap className="size-8 text-primary" />
              <h3 className="font-semibold text-lg">Smart Automation</h3>
              <p className="text-muted-foreground">
                Automatically detect replies, categorize intent, and trigger workflows based on responses.
              </p>
            </div>

            {/* Analytics */}
            <div className="space-y-4 rounded-lg border p-6">
              <BarChart3 className="size-8 text-primary" />
              <h3 className="font-semibold text-lg">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                Track open rates, click rates, replies, and qualified leads in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t px-6 py-24 text-center sm:py-32">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to automate your cold email?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join agencies already using ColdEmail Pro to generate qualified calls.
            </p>
          </div>

          <Button size="lg" asChild>
            <Link href="/auth/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <p>© 2024 ColdEmail Pro. All rights reserved.</p>
      </footer>
    </div>
  )
}
