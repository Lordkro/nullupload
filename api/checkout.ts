import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.STRIPE_PRICE_ID
  if (!secretKey || !priceId) {
    return res.status(500).json({ error: 'Stripe not configured' })
  }

  const stripe = new Stripe(secretKey)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://nullupload.dev/pro?success=true&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://nullupload.dev/pro?canceled=true',
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
