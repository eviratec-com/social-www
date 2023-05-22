import type { NextApiRequest, NextApiResponse } from 'next'
import * as Stripe from 'stripe'

import createPaymentIntent from '@/functions/payments/stripe/createIntent'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ clientSecret: string }|Error>
) {
  try {
    const amount: number = Number(req.query.amount)
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

    const clientSecret: string = await createPaymentIntent(stripe)(amount)

    res.status(200).json({
      clientSecret,
    })
  }
  catch (err) {
    res.status(400).json({
      name: 'CREATE_PAYMENT_INTENT_ERR',
      message: 'Failed to create payment intent'
    })
  }
}
