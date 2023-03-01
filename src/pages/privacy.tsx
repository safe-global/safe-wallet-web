import type { NextPage } from 'next'
import Head from 'next/head'
import SafePrivacyPolicy from '@/components/privacy'

const Privacy: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Imprint</title>
      </Head>

      <main>
        <SafePrivacyPolicy />
      </main>
    </>
  )
}

export default Privacy
