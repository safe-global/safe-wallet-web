import type { NextPage } from 'next'
import Head from 'next/head'
import SafePrivacyPolicy from '@/components/privacy'

const PrivacyPolicy: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Privacy policy</title>
      </Head>

      <main>
        <SafePrivacyPolicy />
      </main>
    </>
  )
}

export default PrivacyPolicy
