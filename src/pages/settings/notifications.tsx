import Head from 'next/head'
import type { NextPage } from 'next'

import SettingsHeader from '@/components/settings/SettingsHeader'
import { PushNotifications } from '@/components/settings/PushNotifications'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import { RecoveryEmail } from '@/components/settings/RecoveryEmail'

const NotificationsPage: NextPage = () => {
  const isNotificationFeatureEnabled = useHasFeature(FEATURES.PUSH_NOTIFICATIONS)
  const isRecoveryEnabled = useHasFeature(FEATURES.RECOVERY)

  if (!isNotificationFeatureEnabled || !isRecoveryEnabled) {
    return null
  }

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Settings – Notifications'}</title>
      </Head>

      <SettingsHeader />

      <main>
        {isRecoveryEnabled && <RecoveryEmail />}

        {isNotificationFeatureEnabled && <PushNotifications />}
      </main>
    </>
  )
}

export default NotificationsPage
