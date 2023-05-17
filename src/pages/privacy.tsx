import type { NextPage } from 'next'
import Head from 'next/head'
import SafePrivacyPolicy from '@/components/privacy'
import { IS_OFFICIAL_HOST } from '@/config/constants'

const PrivacyPolicy: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Privacy policy'}</title>
      </Head>

      <main>{IS_OFFICIAL_HOST && <SafePrivacyPolicy />}</main>
    </>
  )
}

export default PrivacyPolicy
