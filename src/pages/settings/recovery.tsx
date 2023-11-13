import Head from 'next/head'
import type { NextPage } from 'next'

import SettingsHeader from '@/components/settings/SettingsHeader'
import { Recovery } from '@/components/settings/Recovery'

const RecoveryPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Settings – Recovery'}</title>
      </Head>

      <SettingsHeader />

      <main>
        <Recovery />
      </main>
    </>
  )
}

export default RecoveryPage
