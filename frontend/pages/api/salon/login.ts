// frontend/pages/api/salon/login.ts
// Minimal placeholder: accept email and respond success (integration with email service can be added later)

import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Lejohet vetëm POST' } })
  }
  const { email } = req.body || {}
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, error: { code: 'INVALID_DATA', message: 'Email është i detyrueshëm' } })
  }
  // TODO: Implement sending magic link / OTP to email and storing token
  // For now, just respond success so the flow is unblocked
  return res.status(200).json({ success: true })
}


