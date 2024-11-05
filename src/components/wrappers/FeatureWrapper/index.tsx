import type { ReactElement } from 'react'

import { Navigate } from '@/components/common/Navigate'
import { useHasFeature } from '@/hooks/useChains'
import madProps from '@/utils/mad-props'
import type { FEATURES } from '@/utils/chains'

// TODO: Use with swaps/staking
export function _FeatureWrapper({
  children,
  feature,
  to,
  isFeatureEnabled,
}: {
  children: ReactElement
  feature: FEATURES
  to: string
  isFeatureEnabled: typeof useHasFeature
}): ReactElement | null {
  const isEnabled = isFeatureEnabled(feature)

  if (isEnabled === undefined) {
    return null
  }

  if (isEnabled === false) {
    return <Navigate to={to} replace />
  }

  return children
}

export const FeatureWrapper = madProps(_FeatureWrapper, {
  isFeatureEnabled: () => useHasFeature,
})
