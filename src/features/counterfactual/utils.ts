import { computeNewSafeAddress } from '@/components/new-safe/create/logic'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { isSmartContract } from '@/hooks/wallets/web3'
import { defaultSafeInfo } from '@/store/safeInfoSlice'
import type { DeploySafeProps, PredictedSafeProps } from '@safe-global/protocol-kit'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import type { BrowserProvider } from 'ethers'

export const getCounterfactualNonce = async (
  provider: BrowserProvider,
  props: DeploySafeProps,
): Promise<string | undefined> => {
  const safeAddress = await computeNewSafeAddress(provider, props)
  const isContractDeployed = await isSmartContract(provider, safeAddress)

  // Safe is already deployed so we try the next saltNonce
  if (isContractDeployed) {
    return getCounterfactualNonce(provider, { ...props, saltNonce: (Number(props.saltNonce) + 1).toString() })
  }

  return props.saltNonce
}

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
