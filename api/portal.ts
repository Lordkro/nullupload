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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  const jwtSecret = process.env.JWT_SECRET
  if (!secretKey || !jwtSecret) {
    return res.status(500).json({ error: 'Server not configured' })
  }

  const cookies = parseCookies(req.headers.cookie)
  const sessionToken = cookies['nullupload_session']
  if (!sessionToken) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    const payload = jwt.verify(sessionToken, jwtSecret) as {
      customerId: string
      email: string
    }

    const stripe = new Stripe(secretKey)
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: payload.customerId,
      return_url: 'https://nullupload.dev/pro',
    })

    return res.status(200).json({ url: portalSession.url })
  } catch (err) {
    console.error('Portal error:', err)
    return res.status(500).json({ error: 'Failed to create portal session' })
  }
}
