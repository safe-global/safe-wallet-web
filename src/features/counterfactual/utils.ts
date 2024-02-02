import { LATEST_SAFE_VERSION } from '@/config/constants'
import { defaultSafeInfo } from '@/store/safeInfoSlice'
import type { PredictedSafeProps } from '@safe-global/protocol-kit'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'

export const getUndeployedSafeInfo = (undeployedSafe: PredictedSafeProps, address: string, chainId: string) => {
  return Promise.resolve({
    ...defaultSafeInfo,
    address: { value: address },
    chainId,
    owners: undeployedSafe.safeAccountConfig.owners.map((owner) => ({ value: owner })),
    nonce: 0,
    threshold: undeployedSafe.safeAccountConfig.threshold,
    implementationVersionState: ImplementationVersionState.UP_TO_DATE,
    fallbackHandler: { value: undeployedSafe.safeAccountConfig.fallbackHandler! },
    version: LATEST_SAFE_VERSION,
    deployed: false,
  })
}
