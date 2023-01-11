import type { NextPage } from 'next'
import Head from 'next/head'

import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import SafeAppsHeader from '@/components/new-safe-apps/SafeAppsHeader/SafeAppsHeader'
import SafeAppList from '@/components/new-safe-apps/SafeAppList/SafeAppList'

const CustomSafeApps: NextPage = () => {
  // TODO: create a custom hook instead of use useSafeApps
  const { customSafeApps, customSafeAppsLoading, addCustomApp, removeCustomApp } = useSafeApps()

  return (
    <>
      <Head>
        <title>Custom Safe Apps</title>
      </Head>

      <SafeAppsHeader />

      <main>
        <SafeAppList safeAppsList={customSafeApps} addCustomApp={addCustomApp} removeCustomApp={removeCustomApp} />
      </main>
    </>
  )
}

export default CustomSafeApps
