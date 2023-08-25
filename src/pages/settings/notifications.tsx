import Head from 'next/head'
import type { NextPage } from 'next'

import SettingsHeader from '@/components/settings/SettingsHeader'
import { PushNotifications } from '@/components/settings/PushNotifications'

const NotificationsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Settings – Notifications'}</title>
      </Head>

      <SettingsHeader />

      <main>
        <PushNotifications />
      </main>
    </>
  )
}

export default NotificationsPage
