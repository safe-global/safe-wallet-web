import dynamic from 'next/dynamic'

import { AppRoutes } from '@/config/routes'
import { FEATURES } from '@/utils/chains'
import { FeatureWrapper } from '@/components/wrappers/FeatureWrapper'
import { SanctionWrapper } from '@/components/wrappers/SanctionWrapper'
import { DisclaimerWrapper } from '@/components/wrappers/DisclaimerWrapper'

const LOCAL_STORAGE_CONSENT_KEY = 'bridgeConsent'

const BridgeWidget = dynamic(
  () => import('@/features/bridge/components/BridgeWidget').then((module) => module.BridgeWidget),
  {
    ssr: false,
  },
)

export function Bridge() {
  return (
    <FeatureWrapper feature={FEATURES.BRIDGE} fallbackRoute={AppRoutes.home}>
      <SanctionWrapper featureTitle="bridge feature with LI.FI">
        <DisclaimerWrapper localStorageKey={LOCAL_STORAGE_CONSENT_KEY} widgetName="Bridging Widget by LI.FI">
          <BridgeWidget />
        </DisclaimerWrapper>
      </SanctionWrapper>
    </FeatureWrapper>
  )
}
