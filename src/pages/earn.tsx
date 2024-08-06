import AppFrame from '@/components/safe-apps/AppFrame'
import { useDarkMode } from '@/hooks/useDarkMode'
import { SafeAppAccessPolicyTypes, SafeAppFeatures, type SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useMemo } from 'react'

const Earn: NextPage = () => {
  const isDarkMode = useDarkMode()

  const appData: SafeAppData = useMemo(
    () => ({
      id: 1,
      url: `http://widget.local.test/safe-widget/overview?theme=${isDarkMode ? 'dark' : 'light'}`,
      name: 'Earn',
      iconUrl: './images/common/earn.svg',
      description: 'Safe Apps',
      chainIds: ['17000', '11155111', '1', '42161', '137', '56', '8453', '10'],
      accessControl: { type: SafeAppAccessPolicyTypes.NoRestrictions },
      tags: ['safe-apps'],
      features: [SafeAppFeatures.BATCHED_TRANSACTIONS],
      socialProfiles: [],
    }),
    [isDarkMode],
  )

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Earn'}</title>
      </Head>

      <AppFrame
        allowedFeaturesList="clipboard-read; clipboard-write"
        appUrl={appData.url}
        safeAppFromManifest={{ ...appData, safeAppsPermissions: [] }}
      />
    </>
  )
}

export default Earn
