import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import type { ChainInfo, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { getFallbackHandlerContractDeployment, getSafeContractDeployment } from '@/services/contracts/safeContracts'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { assertValidSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'
import { SAFE_FEATURES } from '@safe-global/safe-core-sdk-utils'
import { hasSafeFeature } from '@/utils/safe-versions'
import { Interface } from 'ethers/lib/utils'

const getChangeFallbackHandlerCallData = (
  safe: SafeInfo,
  chain: ChainInfo,
  safeContractInstance: Interface,
): string => {
  if (!hasSafeFeature(SAFE_FEATURES.SAFE_FALLBACK_HANDLER, safe.version)) {
    return '0x'
  }

  const fallbackHandlerContract = getFallbackHandlerContractDeployment(chain.chainId)

  if (!fallbackHandlerContract) {
    throw new Error('No FallbackHandler deployment found')
  }

  return safeContractInstance.encodeFunctionData('setFallbackHandler', [
    fallbackHandlerContract.networkAddresses[chain.chainId],
  ])
}

/**
 * Creates two transactions:
 * - change the mastercopy address
 * - set the fallback handler address
 * Only works for safes < 1.3.0 as the changeMasterCopy function was removed
 */
export const createUpdateSafeTxs = (safe: SafeInfo, chain: ChainInfo): MetaTransactionData[] => {
  assertValidSafeVersion(safe.version)

  const latestMasterCopy = getSafeContractDeployment(chain, LATEST_SAFE_VERSION)

  if (!latestMasterCopy) {
    throw new Error('No latest Safe deployment found')
  }

  const safeContract = getSafeContractDeployment(chain, safe.version)

  if (!safeContract) {
    throw new Error('No Safe deployment found')
  }

  const safeContractInterface = new Interface(safeContract.abi)

  // This was removed in 1.3.0 but we need to support it for older safe versions
  const changeMasterCopyCallData = safeContractInterface.encodeFunctionData('changeMasterCopy', [
    latestMasterCopy.networkAddresses[chain.chainId],
  ])
  const changeFallbackHandlerCallData = getChangeFallbackHandlerCallData(safe, chain, safeContractInterface)

  const txs: MetaTransactionData[] = [
    {
      to: safe.address.value,
      value: '0',
      data: changeMasterCopyCallData,
      operation: OperationType.Call,
    },
    {
      to: safe.address.value,
      value: '0',
      data: changeFallbackHandlerCallData,
      operation: OperationType.Call,
    },
  ]

  return txs
}
