import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk/dist/types/safe-apps'
import {
  SafeAppAccessPolicyTypes,
  SafeAppFeatures,
} from '@safe-global/safe-gateway-typescript-sdk/dist/types/safe-apps'
import { useMemo } from 'react'
import AppFrame from '@/components/safe-apps/AppFrame'
import { useDarkMode } from '@/hooks/useDarkMode'

const StakingWidget = () => {
  const isDarkMode = useDarkMode()

  const appData: SafeAppData = useMemo(
    () => ({
      id: 1,
      url: `https://safe.widget.testnet.kiln.fi/earn?theme=${isDarkMode ? 'dark' : 'light'}`,
      name: 'Stake',
      iconUrl: './images/common/stake.svg',
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
    <AppFrame
      allowedFeaturesList="clipboard-read; clipboard-write"
      appUrl={appData.url}
      safeAppFromManifest={{ ...appData, safeAppsPermissions: [] }}
      isNativeEmbed
    />
  )
}

export default StakingWidget
