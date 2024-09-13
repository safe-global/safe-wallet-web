import { useMemo } from 'react'
import { useDarkMode } from '@/hooks/useDarkMode'
import AppFrame from '@/components/safe-apps/AppFrame'
import { getEmptySafeApp } from '@/components/safe-apps/utils'
import useChainId from '@/hooks/useChainId'
import useChains from '@/hooks/useChains'

const WIDGET_PRODUCTION_URL = 'https://safe.widget.kiln.fi/earn'
const WIDGET_TESTNET_URL = 'https://safe.widget.testnet.kiln.fi/earn'
const widgetAppData = {
  url: WIDGET_PRODUCTION_URL,
  name: 'Stake',
  iconUrl: '/images/common/stake.svg',
  chainIds: ['17000', '11155111', '1', '42161', '137', '56', '8453', '10'],
}

const StakingWidget = () => {
  const isDarkMode = useDarkMode()
  let url = widgetAppData.url
  const currentChainId = useChainId()
  const { configs } = useChains()
  const testChains = useMemo(() => configs.filter((chain) => chain.isTestnet), [configs])

  // if currentChainId is in testChains, then set the url to the testnet version
  if (testChains.some((chain) => chain.chainId === currentChainId)) {
    url = WIDGET_TESTNET_URL
  }

  const appData = useMemo(
    () => ({
      ...getEmptySafeApp(),
      ...widgetAppData,
      url: url + `?theme=${isDarkMode ? 'dark' : 'light'}`,
    }),
    [isDarkMode, url],
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
