import { useCallback, useContext, useEffect, useState } from 'react'
import { InferGetServerSidePropsType } from 'next'
import { GetServerSideProps } from 'next'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/Feed.module.css'

import fetchPosts from '@/functions/fetchPosts'

import Footer from '@/components/Footer'
import SignupForm from '@/components/SignupForm'
import FeedPageHeading from '@/components/FeedPageHeading'

import SessionContext from '@/contexts/SessionContext'

const JoinPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Create Account - Eviratec Social Platform</title>
        <meta name="description" content="Create an account on Eviratec Social Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="rgba(170, 68, 33)" />
        <meta property="og:title" content="Join Eviratec Social Platform" />
        <meta property="og:description" content="Create an account on Eviratec Social Platform" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.eviratecsocial.com/join" />
        <meta property="og:image" content="https://www.eviratecsocial.com/og.png" />
      </Head>

      <main className={styles.main}>
        <FeedPageHeading>
          Join
        </FeedPageHeading>

        <SignupForm />
      </main>

      <Footer />
    </>
  )
}

export default JoinPage
