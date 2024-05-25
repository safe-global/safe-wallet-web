import type { NextPage } from 'next'
import Head from 'next/head'

import SecurityLogin from '@/components/settings/SecurityLogin'

const SecurityLoginPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Settings – Security & Login'}</title>
      </Head>

      <main>
        <SecurityLogin />
      </main>
    </>
  )
}

export default SecurityLoginPage
