import React from 'react'

import Link from 'next/link'

import styles from './About.module.css'

export default function About() {
  return (
    <div className={styles._}>
      <p>
        Eviratec.net is an online web directory.  Join us on our journey, to
        find links from all over the internet, to add to our database.
      </p>

      <p>
        <Link href="mailto:info@eviratec.com">Contact us</Link> for more
        information, including: how to submit a link.
      </p>
    </div>
  )
}
