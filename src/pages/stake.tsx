import type { NextPage } from 'next'
import Head from 'next/head'
import { Box } from '@mui/material'
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
      url: `https://safe.widget.testnet.kiln.fi/earn?theme=${isDarkMode ? 'dark' : 'light'}`,
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

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Stake'}</title>
      </Head>

      {isConsentAccepted === undefined ? null : isConsentAccepted ? (
        <AppFrame
          allowedFeaturesList="clipboard-read; clipboard-write"
          appUrl={appData.url}
          safeAppFromManifest={{ ...appData, safeAppsPermissions: [] }}
          isNativeEmbed
        />
      ) : (
        <Box mt={3}>
          <Disclaimer title="Note" content={<LegalDisclaimerContent />} onAccept={onAccept} buttonText="Continue" />
        </Box>
      )}
    </>
  )
}

export default Swap
