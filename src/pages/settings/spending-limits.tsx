import type { NextPage } from 'next'
import Head from 'next/head'
import SpendingLimits from '@/components/settings/SpendingLimits'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import SettingsIcon from '@/public/images/sidebar/settings.svg'

const SpendingLimitsPage: NextPage = () => {
  return (
    <main>
      <Head>
        <title>Safe – Settings – Spending limit</title>
      </Head>

      <Breadcrumbs Icon={SettingsIcon} first="Settings" second="Spending Limits" />

      <SpendingLimits />
    </main>
  )
}

export default SpendingLimitsPage
