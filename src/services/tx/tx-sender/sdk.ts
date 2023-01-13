import { getSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import type Safe from '@safe-global/safe-core-sdk'
import EthersAdapter from '@safe-global/safe-ethers-lib'
import { ethers } from 'ethers'
import type { Web3Provider } from '@ethersproject/providers'

export const getAndValidateSafeSDK = (): Safe => {
  const safeSDK = getSafeSDK()
  if (!safeSDK) {
    throw new Error('The Safe SDK could not be initialized. Please be aware that we only support v1.1.1 Safes and up.')
  }
  return safeSDK
}

/**
 * https://docs.ethers.io/v5/api/providers/jsonrpc-provider/#UncheckedJsonRpcSigner
 * This resolves the promise sooner when executing a tx and mocks
 * most of the values of transactionResponse which is needed when
 * dealing with smart-contract wallet owners
 */
export const getUncheckedSafeSDK = (provider: Web3Provider): Promise<Safe> => {
  const sdk = getAndValidateSafeSDK()

  const signer = provider.getSigner()
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer.connectUnchecked(),
  })

  return sdk.connect({ ethAdapter })
}
