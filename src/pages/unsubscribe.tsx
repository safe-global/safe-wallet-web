import UnsubscribeEmail from '@/features/recovery/components/RecoveryEmail/UnsubscribeEmail'
import type { NextPage } from 'next'
import Head from 'next/head'

const Unsubscribe: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Unsubscribe from Emails'}</title>
      </Head>

      <main>
        <UnsubscribeEmail />
      </main>
    </>
  )
}

export default Unsubscribe
