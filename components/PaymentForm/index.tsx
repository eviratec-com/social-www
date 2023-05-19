import React, { useCallback, useContext, useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import ProgressBar from '@/components/ProgressBar'

import styles from './PaymentForm.module.css'

import SessionContext from '@/contexts/SessionContext'

import type { UserRegistration } from '@/types/User'
import type { Credentials, Session } from '@/types/Session'

const MIN_PASSWORD_LENGTH: number = 8

interface YearMonthDate {
  year: number
  month: number
  date: number
}

interface Props {
  // cart: ShoppingCart  -- filled with Items?

   // -d "amount=400" \
   // -d "currency=AUD" \
   // -d "description=test charge" \
   // -d "email=roland@pinpayments.com" \
   // -d "ip_address=203.192.1.172" \
   // -d "card[number]=5520000000000000" \
   // -d "card[expiry_month]=05" \
   // -d "card[expiry_year]=2024" \
   // -d "card[cvc]=123" \
   // -d "card[name]=Roland Robot" \
   // -d "card[address_line1]=42 Sevenoaks St" \
   // -d "card[address_line2]=" \
   // -d "card[address_city]=Lathlain" \
   // -d "card[address_postcode]=6454" \
   // -d "card[address_state]=WA" \
   // -d "card[address_country]=Australia" \
   // -d "metadata[OrderNumber]=123456" \
   // -d "metadata[CustomerName]=Roland Robot"
}

export default function PaymentForm({ }: Props) {
  const router = useRouter()

  const session = useContext(SessionContext)

  const emailAddressInputId: string = useId()
  const displayNameInputId: string = useId()
  const tosAcceptInputId: string = useId()
  const usernameInputId: string = useId()
  const passwordInputId: string = useId()
  const dobInputId: string = useId()

  const [emailAddress, setEmailAddress] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [dob, setDob] = useState<string>('')

  const [touchedFields, setTouchedFields] = useState<string[]>([])

  const [usernameAvailable, setUsernameAvailable] = useState<boolean>(false)
  const [usernameChecked, setUsernameChecked] = useState<boolean>(false)
  const [usernameError, setUsernameError] = useState<string>('')
  const [acceptLegal, setAcceptLegal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const checkUsername = useCallback((event): void => {
    setUsernameError('')
    setLoading(true)

    const req = {
      method: 'POST',
      body: JSON.stringify({ username }),
      headers: { 'Content-Type': 'application/json' },
    }

    fetch('/api/checkUsername', req)
      .then((result) => {
        if (400 === result.status) {
          return result.json().then(json => {
            setLoading(false)
            setUsernameError(`Unable to check username availability: ${username}`)
          })
        }

        result.json().then(json => {
          setLoading(false)
          setUsernameChecked(true)
          setUsernameAvailable(json.available)
        })
      })
      .catch((err) => {
        setLoading(false)
        setUsernameError(`Unable to check username availability: ${username}`)
      })

  }, [username])

  const touch = useCallback((key: string): boolean => {
    if (touchedFields.indexOf(key) > -1) {
      return true
    }

    setTouchedFields([
      ...touchedFields,
      key,
    ])

    return true
  }, [touchedFields])

  const validDob = useCallback((input: string): boolean => {
    const now: Date = new Date()

    // Empty or invalid input date
    if (!input || input.length < 10) {
      return false
    }

    const current: YearMonthDate = {
      year: now.getFullYear(),
      month: now.getMonth()+1,
      date: now.getDate(),
    }

    const compare: YearMonthDate = {
      year: Number(input.split('-')[0]),
      month: Number(input.split('-')[1]),
      date: Number(input.split('-')[2]),
    }

    const yearsBetween: number = current.year - compare.year

    // Has it been MORE THAN 18 years (e.g. 19 years) since their birth year?
    if (yearsBetween > 18) {
      return true // YES - it's more than 18 years after their birth year
    }

    // Has it been LESS THAN 18 years (e.g. 17 years) since their birth year?
    if (yearsBetween < 18) {
      return false // NO - it's less than 18 years after their birth year
    }

    // It's their birth year!
    // Is the current month: after the month they were born in
    if (true === current.month > compare.month) {
      return true // YES - it's after their birth month
    }

    // Is the current month: before the month they were born in
    if (true === current.month < compare.month) {
      return false // NO - it's before their birth month
    }

    // It's their birth month!
    // Is the current day of the month: equal to their birth day
    if (current.date === compare.date) {
      return true // YES - it's their 18th birthday today!
    }

    // Is the current day of the month: greater than their birth day
    if (true === current.date > compare.date) {
      return true // YES - it's on or after their birth date
    }

    // Is the current day of the month: less than their birth day
    if (true === current.date < compare.date) {
      return false // NO - it's before their birth date
    }

    return false
  }, [])

  const validEmail = useCallback((input: string): boolean => {
    return !!input.match(/^.+\@.+\..+$/i)
  }, [])

  const validUsername = useCallback((input: string): boolean => {
    const isMatch: boolean = !!input.match(/^[A-Z0-9]{1}[A-Z0-9-._]*[A-Z0-9]{1}$/i)
    const isGtMinLength: boolean = input.length >= 2

    return isMatch && isGtMinLength
  }, [])

  const validPassword = useCallback((input: string): boolean => {
    const hasLowerCaseChar: boolean = !!input.match(/[a-z]/)
    const hasUpperCaseChar: boolean = !!input.match(/[A-Z]/)
    const hasNumber: boolean = !!input.match(/[0-9]/)
    const isGtMinLength: boolean = input.length >= MIN_PASSWORD_LENGTH

    return hasLowerCaseChar && hasUpperCaseChar && hasNumber && isGtMinLength
  }, [])

  const handleSubmit = useCallback((event): void => {
    event.preventDefault()

    if (!displayName) {
      touch(displayNameInputId)
      return
    }

    if (!emailAddress || !validEmail(emailAddress)) {
      touch(emailAddressInputId)
      return
    }

    if (!username || !validUsername(username)) {
      touch(usernameInputId)
      return
    }

    if (!password || !validPassword(password)) {
      touch(passwordInputId)
      return
    }

    if (!dob || !validDob(dob)) {
      touch(dobInputId)
      return
    }

    if (true !== acceptLegal) {
      touch(tosAcceptInputId)
      return
    }

    setError('')
    setLoading(true)

    const u: UserRegistration = {
      email_address: emailAddress,
      display_name: displayName,
      username,
      password,
      dob,
    }

    const opts = {
      method: 'POST',
      body: JSON.stringify(u),
      headers: { 'Content-Type': 'application/json' },
    }

    fetch('/api/join', opts)
      .then((result) => {
        if (400 === result.status) {
          return result.json().then(json => {
            setLoading(false)
            setSuccess(false)
            setError(json.message)
          })
        }

        result.json().then(json => {
          setLoading(false)
          setSuccess(true)
          session.login(json)
          router.push('/links')
        })
      })
      .catch((err) => {
        setLoading(false)
        setSuccess(false)
        setError(err.message)
      })
  }, [
    touch, emailAddress, displayName, username, password, dob, acceptLegal,
    displayNameInputId, emailAddressInputId, usernameInputId, passwordInputId,
    dobInputId, tosAcceptInputId, validEmail, validUsername, validPassword,
    validDob, session, router
  ])

  const touched = useCallback((key: string): boolean => {
    return touchedFields.indexOf(key) > -1
  }, [touchedFields])

  /*
    fields:
      {
        "number": "5520000000000000",
        "expiry_month": "05",
        "expiry_year": "2024",
        "cvc": "123",
        "name": "Roland Robot",
        "address_line1": "42 Sevenoaks St",
        "address_city": "Lathlain",
        "address_postcode": "6454",
        "address_state": "WA",
        "address_country": "Australia"
      }

    exammple request:
      curl https://test-api.pinpayments.com/1/charges -u your-secret-api-key: \
       -d "amount=400" \
       -d "currency=AUD" \
       -d "description=test charge" \
       -d "email=roland@pinpayments.com" \
       -d "ip_address=203.192.1.172" \
       -d "card[number]=5520000000000000" \
       -d "card[expiry_month]=05" \
       -d "card[expiry_year]=2024" \
       -d "card[cvc]=123" \
       -d "card[name]=Roland Robot" \
       -d "card[address_line1]=42 Sevenoaks St" \
       -d "card[address_line2]=" \
       -d "card[address_city]=Lathlain" \
       -d "card[address_postcode]=6454" \
       -d "card[address_state]=WA" \
       -d "card[address_country]=Australia" \
       -d "metadata[OrderNumber]=123456" \
       -d "metadata[CustomerName]=Roland Robot"

      example response:
       {
         "response": {
           "token": "ch_lfUYEBK14zotCTykezJkfg",
           "success": true,
           "amount": 400,
           "currency": "AUD",
           "description": "test charge",
           "email": "roland@pinpayments.com",
           "ip_address": "203.192.1.172",
           "created_at": "2012-06-20T03:10:49Z",
           "status_message": "Success",
           "error_message": null,
           "card": {
             "token": "card_pIQJKMs93GsCc9vLSLevbw",
             "scheme": "master",
             "display_number": "XXXX-XXXX-XXXX-0000",
             "issuing_country": "US",
             "expiry_month": 5,
             "expiry_year": 2024,
             "name": "Roland Robot",
             "address_line1": "42 Sevenoaks St",
             "address_line2": "",
             "address_city": "Lathlain",
             "address_postcode": "6454",
             "address_state": "WA",
             "address_country": "Australia",
             "network_type": null,
             "network_format": null,
             "customer_token": null,
             "primary": null
           },
           "transfer": [],
           "amount_refunded": 0,
           "total_fees": 42,
           "merchant_entitlement": 358,
           "refund_pending": false,
           "authorisation_token": null,
           "authorisation_expired": false,
           "authorisation_voided": false,
           "captured": true,
           "captured_at": "2012-06-20T03:10:49Z",
           "settlement_currency": "AUD",
           "active_chargebacks": false,
           "metadata": {
             "OrderNumber": "123456",
             "CustomerName": "Roland Robot"
           }
         }
       }
  */

  return (
    <div className={styles._}>
      <div className={styles.formWrapper}>
        <form name="login" onSubmit={handleSubmit}>
          <div className={styles.inputField}>
            <label htmlFor={displayNameInputId}>Display Name</label>
            <input
              id={displayNameInputId}
              value={displayName}
              name="displayName"
              placeholder="e.g. John Smith"
              onChange={e => setDisplayName(e.target.value)}
              onBlur={e => touch(displayNameInputId)}
            />

            {touched(displayNameInputId) && displayName.length < 1 &&
              <p className={styles.fieldError}>
                Please choose a display name.
              </p>
            }
          </div>

          <div className={styles.inputField}>
            <label htmlFor={emailAddressInputId}>Email Address</label>
            <input
              id={emailAddressInputId}
              value={emailAddress}
              name="emailAddress"
              type="email"
              onChange={e => setEmailAddress(e.target.value)}
              onBlur={e => touch(emailAddressInputId)}
            />

            {touched(emailAddressInputId) && !validEmail(emailAddress) &&
              <p className={styles.fieldError}>
                Please enter a valid email address.
              </p>
            }
          </div>

          <div className={styles.inputField}>
            <label htmlFor={usernameInputId}>Username</label>
            <input
              id={usernameInputId}
              value={username}
              name="username"
              onChange={e => setUsername(e.target.value)}
              onFocus={e => setUsernameChecked(false)}
              onBlur={e => touch(usernameInputId) && e.target.value && checkUsername(e)}
            />

            {touched(usernameInputId) && !validUsername(username) &&
              <p className={styles.fieldError}>
                Please enter a valid username. Usernames may only contain:
                <ul>
                  <li>English alphabet (A-Z)</li>
                  <li>Numbers (0-9)</li>
                  <li>Hyphens (-), Underscores (_), and Periods (.)</li>
                </ul>
              </p>
            }

            {usernameChecked && usernameAvailable &&
              <p className={styles.fieldSuccess}>Username available!</p>
            }

            {usernameChecked && !usernameAvailable &&
              <p className={styles.fieldError}>
                Username {username} is not available.
              </p>
            }

            {usernameError &&
              <p className={styles.fieldError}>{usernameError}</p>
            }
          </div>

          <div className={styles.inputField}>
            <label htmlFor={passwordInputId}>Password</label>
            <input
              id={passwordInputId}
              value={password}
              name="password"
              type="password"
              onChange={e => setPassword(e.target.value)}
              onBlur={e => touch(passwordInputId)}
            />

            {touched(passwordInputId) && !validPassword(password) &&
              <p className={styles.fieldError}>
                Passwords must contain:
                <ul>
                  <li>At least {MIN_PASSWORD_LENGTH} characters</li>
                  <li>One upper-case letter</li>
                  <li>One lower-case letter</li>
                  <li>One number</li>
                </ul>
              </p>
            }
          </div>

          <div className={styles.inputField}>
            <label htmlFor={dobInputId}>Date of Birth</label>
            <input
              id={dobInputId}
              value={dob}
              name="dob"
              type="date"
              onChange={e => setDob(e.target.value)}
              onBlur={e => touch(dobInputId)}
            />

            {touched(dobInputId) && !validDob(dob) &&
              <p className={styles.fieldError}>
                You must be at least 18 years old to join.
              </p>
            }
          </div>

          <div className={styles.tosAcceptWrapper}>
            <label>
              <input
                type="checkbox"
                value="accept"
                onChange={e => setAcceptLegal('accept' == e.target.value)}
              />

              I have read and agree to the
              <Link href={`/terms`} legacyBehavior>
                <a target="_blank">Terms of Use</a>
              </Link>
              and
              <Link href={`/privacy`} legacyBehavior>
                <a target="_blank">Privacy Policy</a>
              </Link>
              for MyPornFeed.com.
            </label>

            {touched(tosAcceptInputId) && true !== acceptLegal &&
              <p className={styles.fieldError}>
                Please accept the Terms of Use and Privacy Policy.
              </p>
            }
          </div>

          <div className={styles.submitButtonWrapper}>
            <button type="submit" disabled={loading}>Create Account</button>
          </div>
        </form>
      </div>

      {loading && (
        <div className={styles.loginResult}>
          <ProgressBar />
        </div>
      )}

      {success && (
        <div className={styles.loginResult}>
          <ProgressBar />
          <p className={styles.loginSuccess}>Login success! Redirecting...</p>
        </div>
      )}

      {error && (
        <div className={styles.loginResult}>
          <p className={styles.loginError}>Error: {error}</p>
        </div>
      )}
    </div>
  )
}
