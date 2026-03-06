import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { verifyTransaction } from '@/lib/flutterwave'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    tx_ref?: string
    transaction_id?: string
    status?: string
  }>
}

export default async function BillingCallbackPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { tx_ref, transaction_id, status } = params

  if (!tx_ref) {
    redirect('/billing')
  }

  // Check payment status
  let paymentVerified = false
  let errorMessage = ''

  if (status === 'successful' && transaction_id) {
    try {
      const verification = await verifyTransaction(transaction_id)
      
      if (verification.status === 'success' && verification.data.status === 'successful') {
        paymentVerified = true
        
        // The webhook should have already processed this, but we can double-check
        const supabase = await createServerSupabaseClient()
        const { data: payment } = await supabase
          .from('payments')
          .select('id')
          .eq('flutterwave_tx_ref', tx_ref)
          .single()

        if (!payment) {
          // Webhook hasn't processed yet - show pending state
          paymentVerified = false
          errorMessage = 'Payment is being processed. Please wait a moment.'
        }
      } else {
        errorMessage = 'Payment verification failed'
      }
    } catch (error) {
      console.error('Verification error:', error)
      errorMessage = 'Unable to verify payment'
    }
  } else if (status === 'cancelled') {
    errorMessage = 'Payment was cancelled'
  } else {
    errorMessage = 'Payment was not completed'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 text-center">
        {paymentVerified ? (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Your subscription has been activated. Thank you for your purchase!
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/billing">View Billing</Link>
              </Button>
            </div>
          </>
        ) : errorMessage === 'Payment is being processed. Please wait a moment.' ? (
          <>
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Processing Payment...</h1>
            <p className="text-muted-foreground mb-6">
              {errorMessage}
            </p>
            <Button asChild className="w-full">
              <Link href="/billing">Check Status</Link>
            </Button>
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-muted-foreground mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/billing">Try Again</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground mt-6">
          Transaction Reference: {tx_ref}
        </p>
      </Card>
    </div>
  )
}
