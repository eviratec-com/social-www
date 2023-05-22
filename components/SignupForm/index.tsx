import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useState
} from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  useStripe,
  useElements,
  PaymentElement
} from '@stripe/react-stripe-js'

import ProgressBar from '@/components/ProgressBar'

import styles from './SignupForm.module.css'

import SessionContext from '@/contexts/SessionContext'

import * as PLAN from '@/inc/plans'

import type { Plan } from '@/types/Plan'
import type { UserRegistration } from '@/types/User'
import type { Credentials, Session } from '@/types/Session'

const MIN_PASSWORD_LENGTH: number = 8

interface YearMonthDate {
  year: number
  month: number
  date: number
}

interface Props {
  onChangePlan?: (newPlan: string) => void
  onChangeAmount?: (newAmount: number) => void
}

interface JoinResult {
  session: Session
  stripe: {
    customer: string
  }
}

export default function SignupForm({ onChangePlan, onChangeAmount }: Props) {
  const router = useRouter()

  const stripe = useStripe()
  const elements = useElements()

  const session = useContext(SessionContext)

  const emailAddressInputId: string = useId()
  const displayNameInputId: string = useId()
  const tosAcceptInputId: string = useId()
  const usernameInputId: string = useId()
  const passwordInputId: string = useId()
  const dobInputId: string = useId()

  const siteNameInputId: string = useId()
  const sitePlanSelectId: string = useId()

  const [emailAddress, setEmailAddress] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [dob, setDob] = useState<string>('')

  const [site, setSite] = useState<string>('')
  const [domain, setDomain] = useState<string>('.eviratecsocial.life')
  const [siteName, setSiteName] = useState<string>('')
  const [sitePlan, setSitePlan] = useState<string>(PLAN.LITE_PLAN.externalId.stripe)

  const [touchedFields, setTouchedFields] = useState<string[]>([])

  const [usernameAvailable, setUsernameAvailable] = useState<boolean>(false)
  const [usernameChecked, setUsernameChecked] = useState<boolean>(false)
  const [loadingUsername, setLoadingUsername] = useState<boolean>(false)
  const [usernameError, setUsernameError] = useState<string>('')
  const [acceptLegal, setAcceptLegal] = useState<boolean>(false)
  const [payError, setPayError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const [joinResult, setJoinResult] = useState<JoinResult|null>(null)

  useEffect(() => {
    setSite(`${username}${domain}`)
  }, [username, domain])

  const [plans, setPlans] = useState<Plan[]>([
    PLAN.LITE_PLAN,
    PLAN.STANDARD_PLAN,
    PLAN.PREMIUM_PLAN,
  ])

  // validInputChar(input: string)
  // prevents input of invalid chars in username(domain) field
  const validInputChar = useCallback((input: string): boolean => {
    return !!input.match(/^([A-Z]{1}[A-Z0-9-]{1,}|[A-Z]{1}|)$/i)
  }, [])

  const validUsername = useCallback((input: string): boolean => {
    const isMatch: boolean = !!input.match(/^[A-Z]{1}[A-Z0-9-]{1,}[A-Z0-9]{1}$/i)
    const isGtMinLength: boolean = input.length >= 3

    return isMatch && isGtMinLength
  }, [])

  const checkUsername = useCallback((event): void => {
    if (!validUsername(username)) {
      return
    }

    setUsernameError('')
    setLoading(true)
    setLoadingUsername(true)

    const req = {
      method: 'POST',
      body: JSON.stringify({ username }),
      headers: { 'Content-Type': 'application/json' },
    }

    fetch('/api/checkUsername', req)
      .then((result) => {
        if (400 === result.status) {
          return result.json().then(json => {
            setLoadingUsername(false)
            setLoading(false)
            setUsernameError(
              `Unable to check subdomain availability: ${username}.eviratecsocial.online`
            )
          })
        }

        result.json().then(json => {
          setLoadingUsername(false)
          setLoading(false)
          setUsernameChecked(true)
          setUsernameAvailable(json.available)
        })
      })
      .catch((err) => {
        setLoadingUsername(false)
        setLoading(false)
        setUsernameError(
          `Unable to check subdomain availability: ${username}.eviratecsocial.online`
        )
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

  const validPassword = useCallback((input: string): boolean => {
    const hasLowerCaseChar: boolean = !!input.match(/[a-z]/)
    const hasUpperCaseChar: boolean = !!input.match(/[A-Z]/)
    const hasNumber: boolean = !!input.match(/[0-9]/)
    const isGtMinLength: boolean = input.length >= MIN_PASSWORD_LENGTH

    return hasLowerCaseChar && hasUpperCaseChar && hasNumber && isGtMinLength
  }, [])

  const processPayment = useCallback(async () => {
    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit()

    if (submitError) {
      setError(submitError.message)
      return
    }

    // Create the SetupIntent and obtain clientSecret
    const res = await fetch(
      `/api/setupIntent`,
      {
        method: 'POST',
        body: JSON.stringify({ customer: joinResult.stripe.customer }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const { client_secret: clientSecret } = await res.json()

    // Confirm the SetupIntent using the details collected by the Payment Element
    const { error } = await stripe.confirmSetup({
      elements,
      clientSecret,
      confirmParams: {
        return_url: process.env.NEXT_PUBLIC_STRIPE_RETURN_URL,
      },
    });

    if (error) {
      // This point is only reached if there's an immediate error when
      // confirming the setup. Show the error to your customer (for example, payment details incomplete)
      setError(error.message);
    } else {
      // Your customer is redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer is redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  }, [elements, joinResult])

  const handleSubmit = useCallback((event): void => {
    event.preventDefault()

    if (true === loading) {
      return
    }

    if (true === success && true === payError) {
      processPayment()
      return
    }

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

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      setError('Loading payment form...')
      return;
    }

    setError('')
    setLoading(true)

    const u: UserRegistration = {
      email_address: emailAddress,
      display_name: displayName,
      username,
      password,
      site_name: siteName,
      site_plan: sitePlan,
      site,
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
          setJoinResult(json)
          session.login(json.session)
          processPayment()
        })
      })
      .catch((err) => {
        setLoading(false)
        setSuccess(false)
        setError(err.message)
      })
  }, [
    touch, emailAddress, displayName, username, password, siteName, sitePlan,
    site, dob, acceptLegal, displayNameInputId, emailAddressInputId,
    usernameInputId, passwordInputId, dobInputId, tosAcceptInputId, validEmail,
    validUsername, validPassword, validDob, session, router, stripe, elements,
    success, payError
  ])

  const touched = useCallback((key: string): boolean => {
    return touchedFields.indexOf(key) > -1
  }, [touchedFields])

  useEffect(() => {
    if (!sitePlan) {
      return
    }

    onChangePlan && onChangePlan(sitePlan)
    onChangeAmount && onChangeAmount(plans.filter(plan => {
      return plan.externalId.stripe === sitePlan
    })[0].ppm*100)
  }, [sitePlan, plans])

  return (
    <div className={styles._}>
      <div className={styles.formWrapper}>
        <form name="login" onSubmit={handleSubmit}>
          <section className={styles.accountInfo}>
            <div className={styles.inputField}>
              <label htmlFor={displayNameInputId}>Your Full Name</label>
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
                for EviratecSocial.
              </label>

              {touched(tosAcceptInputId) && true !== acceptLegal &&
                <p className={styles.fieldError}>
                  Please accept the Terms of Use and Privacy Policy.
                </p>
              }
            </div>

            <div className={styles.submitButtonWrapper}>
              <button type="submit" disabled={loading}>Save &amp; Continue</button>
            </div>
          </section>

          <section className={styles.siteInfo}>
            <div className={styles.inputField}>
              <label htmlFor={siteNameInputId}>Site Name</label>
              <input
                id={siteNameInputId}
                value={siteName}
                name="siteName"
                placeholder="e.g. John's Book Club"
                onChange={e => setSiteName(e.target.value)}
                onBlur={e => touch(siteNameInputId)}
              />

              {touched(siteNameInputId) && siteName.length < 1 &&
                <p className={styles.fieldError}>
                  Please choose a site name.
                </p>
              }
            </div>

            <div className={styles.inputField}>
              <label htmlFor={usernameInputId}>Choose Sub-Domain</label>
              <div className={styles.urlPicker}>
                <span className={styles.urlPickerProtocol}>https://</span>
                <div className={styles.urlPickerInput}>
                  <input
                    id={usernameInputId}
                    value={username}
                    name="username"
                    placeholder="yourname"
                    className={styles.usernameInput}
                    onChange={e => validInputChar(e.target.value) && setUsername(e.target.value)}
                    onFocus={e => setUsernameChecked(false)}
                    onBlur={e => touch(usernameInputId) && e.target.value && checkUsername(e)}
                  />
                </div>

                <div className={styles.urlPickerDomain}>
                  <select
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                  >
                    <option value=".eviratecsocial.life" selected>.eviratecsocial.life</option>
                  </select>
                </div>
              </div>

              {touched(usernameInputId) && !validUsername(username) && username.length <= 2 &&
                <p className={styles.fieldError}>
                  Please enter a valid sub-domain.
                  <br />Sub-domain names must be at least 3 characters.
                </p>
              }

              {touched(usernameInputId) && !validUsername(username) && username.length > 2 &&
                <p className={styles.fieldError}>
                  Please enter a valid sub-domain. Sub-domain names may only contain:
                  <ul>
                    <li>English alphabet (A-Z)</li>
                    <li>Numbers (0-9)</li>
                    <li>Hyphens (-)</li>
                  </ul>
                </p>
              }

              {loadingUsername &&
                <p className={styles.fieldSuccess}>Checking availability...</p>
              }

              {usernameChecked && usernameAvailable &&
                <p className={styles.fieldSuccess}>
                  {username}.eviratecsocial.online is available!
                </p>
              }

              {usernameChecked && !usernameAvailable &&
                <p className={styles.fieldError}>
                  Domain {username}.eviratecsocial.online is not available.
                </p>
              }

              {usernameError &&
                <p className={styles.fieldError}>{usernameError}</p>
              }
            </div>

            <div className={styles.inputField}>
              <label htmlFor={sitePlanSelectId}>Select Plan</label>
              <select
                id={sitePlanSelectId}
                value={sitePlan}
                name="sitePlan"
                onChange={e => setSitePlan(e.target.value)}
                onBlur={e => touch(sitePlanSelectId)}
              >
                {plans.length && plans.map((plan: Plan) => {
                  return (
                    <option
                      value={plan.externalId.stripe}
                      key={`opt/${plan.externalId.stripe}`}
                    >
                      {plan.title} (${plan.ppm} /month)
                    </option>
                  )
                })}
              </select>
            </div>

            <div className={styles.inputField}>
              <PaymentElement options={{
                defaultValues: {
                  billingDetails: {
                    name: displayName,
                    email: emailAddress,
                  },
                },
              }} />
            </div>
          </section>
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
