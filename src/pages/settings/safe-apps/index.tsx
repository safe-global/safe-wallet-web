import type { NextPage } from 'next'
import Head from 'next/head'

import SafeAppsPermissions from '@/components/settings/SafeAppsPermissions'
import SettingsHeader from '@/components/settings/SettingsHeader'

const SafeAppsPermissionsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe{'{Wallet}'} – Settings – Safe Apps permissions</title>
      </Head>

      <SettingsHeader />

      <main>
        <SafeAppsPermissions />
      </main>
    </>
  )
}

export default SafeAppsPermissionsPage
