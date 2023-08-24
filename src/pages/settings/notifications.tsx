import Head from 'next/head'
import type { NextPage } from 'next'

import SettingsHeader from '@/components/settings/SettingsHeader'
import { SafeNotifications } from '@/components/settings/Notifications'

const NotificationsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Settings – Notifications'}</title>
      </Head>

      <SettingsHeader />

      <main>
        <SafeNotifications />
      </main>
    </>
  )
}

export default NotificationsPage
