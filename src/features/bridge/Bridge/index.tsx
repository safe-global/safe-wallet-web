import dynamic from 'next/dynamic'
import type { ReactElement } from 'react'

import { Navigate } from '@/components/common/Navigate'
import { AppRoutes } from '@/config/routes'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import madProps from '@/utils/mad-props'

const BridgeWidget = dynamic(() => import('@/features/bridge/BridgeWidget').then((module) => module.BridgeWidget), {
  ssr: false,
})

export function _Bridge({ isFeatureEnabled }: { isFeatureEnabled: typeof useHasFeature }): ReactElement {
  const isEnabled = isFeatureEnabled(FEATURES.BRIDGE)

  if (isEnabled === false) {
    return <Navigate to={AppRoutes.home} replace />
  }

  // TODO: Consent logic

  return <BridgeWidget />
}

export const Bridge = madProps(_Bridge, {
  isFeatureEnabled: () => useHasFeature,
})
