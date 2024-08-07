import type { NextPage } from 'next'
import Head from 'next/head'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk/dist/types/safe-apps'
import {
  SafeAppAccessPolicyTypes,
  SafeAppFeatures,
} from '@safe-global/safe-gateway-typescript-sdk/dist/types/safe-apps'
import { useMemo } from 'react'
import AppFrame from '@/components/safe-apps/AppFrame'
import Disclaimer from '@/components/common/Disclaimer'
import LegalDisclaimerContent from '@/features/stake/components/LegalDisclaimer'
import useStakeConsent from '@/features/stake/useStakeConsent'
import { useDarkMode } from '@/hooks/useDarkMode'

const Swap: NextPage = () => {
  const isDarkMode = useDarkMode()

  const appData: SafeAppData = useMemo(
    () => ({
      id: 1,
      url: `https://widget.devnet.kiln.fi/safe-widget/overview?theme=${isDarkMode ? 'dark' : 'light'}`,
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

  const { isConsentAccepted, onAccept } = useStakeConsent()

  let content = (
    <AppFrame
      allowedFeaturesList="clipboard-read; clipboard-write"
      appUrl={appData.url}
      safeAppFromManifest={{ ...appData, safeAppsPermissions: [] }}
    />
  )

  if (!isConsentAccepted) {
    content = <Disclaimer title="Note" content={<LegalDisclaimerContent />} onAccept={onAccept} buttonText="Continue" />
  }

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Stake'}</title>
      </Head>

      {content}
    </>
  )
}

export default Swap
