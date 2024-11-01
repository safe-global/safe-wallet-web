import { useMemo } from 'react'
import type { ReactElement } from 'react'

import AppFrame from '@/components/safe-apps/AppFrame'
import { getEmptySafeApp } from '@/components/safe-apps/utils'
import useChains from '@/hooks/useChains'
import { FEATURES, hasFeature } from '@/utils/chains'
import type { SafeAppDataWithPermissions } from '@/components/safe-apps/types'

const BRIDGE_WIDGET_URL = 'https://iframe.jumper.exchange/'

export function BridgeWidget(): ReactElement {
  const { configs } = useChains()

  const appData = useMemo((): SafeAppDataWithPermissions => {
    const chainIds = configs?.reduce<Array<string>>((acc, cur) => {
      if (hasFeature(cur, FEATURES.BRIDGE)) {
        acc.push(cur.chainId)
      }
      return acc
    }, [])

    return {
      ...getEmptySafeApp(),
      name: 'Bridge',
      iconUrl: '/images/common/bridge.svg',
      chainIds,
      url: BRIDGE_WIDGET_URL,
    }
  }, [configs])

  return (
    <AppFrame
      appUrl={appData.url}
      allowedFeaturesList="clipboard-read; clipboard-write"
      safeAppFromManifest={appData}
      isNativeEmbed
    />
  )
}
