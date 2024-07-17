import type { NextPage } from 'next'
import Head from 'next/head'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk/dist/types/safe-apps'
import {
  SafeAppAccessPolicyTypes,
  SafeAppFeatures,
} from '@safe-global/safe-gateway-typescript-sdk/dist/types/safe-apps'
import { useMemo } from 'react'
import AppFrame from '@/components/safe-apps/AppFrame'

const Swap: NextPage = () => {
  const appData: SafeAppData = useMemo(
    () => ({
      id: 321412441,
      url: 'https://widget.devnet.kiln.fi/d6309182-cbad-11ec-9d64-0242ac120003/overview',
      name: 'Stake',
      iconUrl: './images/common/earn.svg',
      description: 'Safe Apps',
      chainIds: ['17000', '11155111', '1', '42161', '137', '56', '8453', '10'],
      accessControl: { type: SafeAppAccessPolicyTypes.NoRestrictions },
      tags: ['safe-apps'],
      features: [SafeAppFeatures.BATCHED_TRANSACTIONS],
      socialProfiles: [],
    }),
    [],
  )

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Stake'}</title>
      </Head>

      <AppFrame
        allowedFeaturesList="clipboard-read; clipboard-write"
        appUrl={appData.url}
        safeAppFromManifest={{ ...appData, safeAppsPermissions: [] }}
      />
    </>
  )
}

export default Swap
