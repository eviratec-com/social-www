import type { NextApiRequest, NextApiResponse } from 'next'
import * as Stripe from 'stripe'

import signup from '@/functions/signup'
import setCookie from '@/functions/setCookie'
import createSession from '@/functions/createSession'
import checkUsername from '@/functions/users/checkUsername'
import createCustomer from '@/functions/payments/stripe/createCustomer'
import createSite from '@/functions/sites/createSite'
import claimSiteById from '@/functions/users/claimSiteById'

import type { Session } from '@/types/Session'
import type { User, UserRegistration } from '@/types/User'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Session|Error>
) {
  try {
    const {
      email_address,
      display_name,
      username,
      password,
      siteName,
      sitePlan,
      site,
      dob
    } = req.body

    // Check the username is available
    const usernameAvailable = await checkUsername(username)

    if (!usernameAvailable) {
      return res.status(400).json({
        name: 'SIGNUP_ERROR',
        message: `Username '${username}' is not available.`
      })
    }

    // Create the user account
    const u: User = await signup({
      email_address,
      display_name,
      username,
      password,
      dob,
    })

    if (!u) {
      return res.status(400).json({
        name: 'SIGNUP_ERROR',
        message: `Failed to create account: ${username}`
      })
    }

    // Create a session
    const s: Session = await createSession({
      user: u.id
    })

    setCookie(res, 'eviratecseshid', s.token, { path: '/', maxAge: 86400*3 })

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
    const _stripeCust = await createCustomer(stripe)({
      email: email_address,
      user: u.id,
      name: display_name,
    }, {
      line1: '21 CASTOR STREET',
      line2: '',
      city: 'CLIFTON BEACH',
      zip: '4879',
      state: 'QLD',
      country: 'AU'
    })

    await setUserMetaValue(u.id, 'stripe_customer_id', _stripeCust.id)
    await setUserMetaValue(u.id, 'next_plan_price_id', 'price_1NAApTK0rKl89eyeewomgfK9')

    const userSite: Site = await createSite({
      name: siteName,
      plan: sitePlan,
      fqdn: site,
      subscription: 'PENDING'
    })

    await claimSiteById(u.id, userSite.id)

    await setUserMetaValue(u.id, 'next_plan_for_site', userSite.id)

    // Send response body
    res.status(200).json(s)
  }
  catch (err) {
    res.status(400).json({
      name: 'JOIN_ERROR',
      message: err.message
    })
  }
}
