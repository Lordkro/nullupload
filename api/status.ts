import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import jwt from 'jsonwebtoken'

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {}
  const cookies: Record<string, string> = {}
  cookieHeader.split(';').forEach((c) => {
    const [key, ...rest] = c.trim().split('=')
    if (key) cookies[key] = rest.join('=')
  })
  return cookies
}

function setSessionCookie(res: VercelResponse, token: string) {
  res.setHeader(
    'Set-Cookie',
    `nullupload_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24 * 30}`,
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const jwtSecret = process.env.JWT_SECRET
  if (!secretKey || !jwtSecret) {
    return res.status(500).json({ error: 'Server not configured' })
  }

  const stripe = new Stripe(secretKey)

  // If session_id is provided (post-checkout redirect), look up the session
  const sessionId = req.query.session_id as string | undefined
  if (sessionId) {
    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription'],
      })

      const customerId = checkoutSession.customer as string
      const email = checkoutSession.customer_details?.email || ''

      // Sign JWT and set cookie
      const token = jwt.sign({ customerId, email }, jwtSecret)
      setSessionCookie(res, token)

      // Get subscription status
      const subscription = checkoutSession.subscription as Stripe.Subscription | null
      if (subscription && subscription.status === 'active') {
        return res.status(200).json({
          isPro: true,
          subscription: {
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
          },
        })
      }

      return res.status(200).json({ isPro: false, subscription: null })
    } catch (err) {
      console.error('Session lookup error:', err)
      return res.status(200).json({ isPro: false, subscription: null })
    }
  }

  // Otherwise, check existing cookie
  const cookies = parseCookies(req.headers.cookie)
  const sessionToken = cookies['nullupload_session']
  if (!sessionToken) {
    return res.status(200).json({ isPro: false, subscription: null })
  }

  try {
    const payload = jwt.verify(sessionToken, jwtSecret) as {
      customerId: string
      email: string
    }

    // List active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: payload.customerId,
      status: 'active',
      limit: 1,
    })

    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0]
      return res.status(200).json({
        isPro: true,
        subscription: {
          status: sub.status,
          currentPeriodEnd: sub.current_period_end,
        },
      })
    }

    return res.status(200).json({ isPro: false, subscription: null })
  } catch (err) {
    console.error('Cookie verification error:', err)
    // Invalid cookie — clear it
    res.setHeader(
      'Set-Cookie',
      'nullupload_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
    )
    return res.status(200).json({ isPro: false, subscription: null })
  }
}
