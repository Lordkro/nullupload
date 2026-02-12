import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

// Disable body parsing — we need the raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  const stripe = new Stripe(secretKey)
  const rawBody = await getRawBody(req)

  let event: Stripe.Event

  if (webhookSecret) {
    // Verify signature when webhook secret is configured
    const signature = req.headers['stripe-signature'] as string
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return res.status(400).json({ error: 'Webhook signature verification failed' })
    }
  } else {
    // Fallback: parse body without verification (development only)
    console.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification')
    try {
      event = JSON.parse(rawBody.toString()) as Stripe.Event
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' })
    }
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      console.log(
        `Checkout completed: customer=${session.customer}, email=${session.customer_details?.email}`,
      )
      // Subscription is active — status endpoint handles checking via cookie
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      console.log(
        `Subscription updated: id=${subscription.id}, status=${subscription.status}, customer=${subscription.customer}`,
      )
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      console.log(
        `Subscription deleted: id=${subscription.id}, customer=${subscription.customer}`,
      )
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return res.status(200).json({ received: true })
}
