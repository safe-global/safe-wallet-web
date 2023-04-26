import type { NextPage } from 'next'
import Head from 'next/head'
import SpendingLimits from '@/components/settings/SpendingLimits'
import SettingsHeader from '@/components/settings/SettingsHeader'

const SpendingLimitsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Settings – Spending limit'}</title>
      </Head>

      <SettingsHeader />

      <main>
        <SpendingLimits />
      </main>
    </>
  )
}

export default SpendingLimitsPage
