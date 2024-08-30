import { useMemo } from 'react'
import { useDarkMode } from '@/hooks/useDarkMode'
import AppFrame from '@/components/safe-apps/AppFrame'
import { getEmptySafeApp } from '@/components/safe-apps/utils'

const widgetAppData = {
  url: 'https://safe.widget.testnet.kiln.fi/earn',
  name: 'Stake',
  iconUrl: '/images/common/stake.svg',
  chainIds: ['17000', '11155111', '1', '42161', '137', '56', '8453', '10'],
}

const StakingWidget = () => {
  const isDarkMode = useDarkMode()

  const appData = useMemo(
    () => ({
      ...getEmptySafeApp(),
      ...widgetAppData,
      url: widgetAppData.url + `?theme=${isDarkMode ? 'dark' : 'light'}`,
    }),
    [isDarkMode],
  )

  return (
    <AppFrame
      appUrl={appData.url}
      allowedFeaturesList="clipboard-read; clipboard-write"
      safeAppFromManifest={appData}
      isNativeEmbed
    />
  )
}

export default StakingWidget
