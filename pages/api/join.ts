import type { NextApiRequest, NextApiResponse } from 'next'

import signup from '@/functions/signup'
import setCookie from '@/functions/setCookie'
import createSession from '@/functions/createSession'
import checkUsername from '@/functions/users/checkUsername'

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
