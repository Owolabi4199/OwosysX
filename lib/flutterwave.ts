import crypto from 'crypto'

// Validate required environment variables at module load time
function validateEnv() {
  const missingVars: string[] = []

  if (!process.env.FLUTTERWAVE_SECRET_KEY) {
    missingVars.push('FLUTTERWAVE_SECRET_KEY')
  }
  if (!process.env.FLUTTERWAVE_PUBLIC_KEY) {
    missingVars.push('FLUTTERWAVE_PUBLIC_KEY')
  }
  if (!process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
    missingVars.push('FLUTTERWAVE_WEBHOOK_SECRET')
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Flutterwave environment variables: ${missingVars.join(', ')}. ` +
      'Please ensure these are set in your environment.'
    )
  }
}

validateEnv()

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY as string
const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY as string
const FLUTTERWAVE_WEBHOOK_SECRET = process.env.FLUTTERWAVE_WEBHOOK_SECRET as string
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export interface FlutterwavePaymentPayload {
  tx_ref: string
  amount: number
  currency: string
  redirect_url: string
  customer: {
    email: string
    name?: string
    phonenumber?: string
  }
  customizations?: {
    title?: string
    description?: string
    logo?: string
  }
  meta?: Record<string, unknown>
  payment_plan?: string
}

export interface FlutterwaveTransaction {
  id: number
  tx_ref: string
  flw_ref: string
  device_fingerprint: string
  amount: number
  currency: string
  charged_amount: number
  app_fee: number
  merchant_fee: number
  processor_response: string
  auth_model: string
  ip: string
  narration: string
  status: string
  payment_type: string
  created_at: string
  account_id: number
  customer: {
    id: number
    name: string
    phone_number: string
    email: string
    created_at: string
  }
  meta?: Record<string, unknown>
}

// Generate a unique transaction reference
export function generateTxRef(userId: string, planSlug: string): string {
  const timestamp = Date.now()
  const random = crypto.randomBytes(4).toString('hex')
  return `CE-${planSlug.toUpperCase()}-${userId.slice(0, 8)}-${timestamp}-${random}`
}

// Initialize Flutterwave payment
export async function initializePayment(payload: FlutterwavePaymentPayload) {
  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const data = await response.json()
  return data
}

// Verify a transaction
export async function verifyTransaction(transactionId: string) {
  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const data = await response.json()
  return data
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac('sha256', FLUTTERWAVE_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
  
  return hash === signature
}

// Create subscription checkout URL
export async function createSubscriptionCheckout(
  userId: string,
  userEmail: string,
  userName: string,
  planSlug: string,
  planName: string,
  amount: number,
  billingCycle: 'monthly' | 'yearly'
) {
  const txRef = generateTxRef(userId, planSlug)
  
  const payload: FlutterwavePaymentPayload = {
    tx_ref: txRef,
    amount,
    currency: 'NGN',
    redirect_url: `${BASE_URL}/billing/callback?tx_ref=${txRef}`,
    customer: {
      email: userEmail,
      name: userName || userEmail
    },
    customizations: {
      title: 'ColdEmail Pro Subscription',
      description: `${planName} Plan - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Subscription`,
      logo: `${BASE_URL}/logo.png`
    },
    meta: {
      user_id: userId,
      plan_slug: planSlug,
      billing_cycle: billingCycle,
      subscription_type: 'new'
    }
  }

  const result = await initializePayment(payload)
  
  if (result.status === 'success') {
    return {
      success: true,
      paymentLink: result.data.link,
      txRef
    }
  }

  return {
    success: false,
    error: result.message || 'Failed to initialize payment'
  }
}

// Get Flutterwave public key for client-side
export function getPublicKey(): string {
  return FLUTTERWAVE_PUBLIC_KEY
}

// Process successful payment
export async function processSuccessfulPayment(
  transaction: FlutterwaveTransaction,
  meta: { user_id: string; plan_slug: string; billing_cycle: string }
) {
  // This will be called from the webhook handler
  // Returns the data needed to update the database
  const periodStart = new Date()
  const periodEnd = new Date()
  
  if (meta.billing_cycle === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }

  return {
    userId: meta.user_id,
    planSlug: meta.plan_slug,
    billingCycle: meta.billing_cycle as 'monthly' | 'yearly',
    flutterwaveTxId: transaction.id.toString(),
    flutterwaveTxRef: transaction.tx_ref,
    amount: transaction.amount,
    currency: transaction.currency,
    periodStart,
    periodEnd
  }
}
