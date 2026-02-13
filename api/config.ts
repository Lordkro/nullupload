import { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'NOT_SET' })
}
