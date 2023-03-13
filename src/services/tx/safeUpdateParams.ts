import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import type GnosisSafeContractEthers from '@safe-global/safe-ethers-lib/dist/src/contracts/GnosisSafe/GnosisSafeContractEthers'
import type { ChainInfo, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { getFallbackHandlerContractInstance, getGnosisSafeContractInstance } from '@/services/contracts/safeContracts'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { assertValidSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'
import { SAFE_FEATURES } from '@safe-global/safe-core-sdk-utils'
import { hasSafeFeature } from '@/utils/safe-versions'

const getChangeFallbackHandlerCallData = (
  safe: SafeInfo,
  chain: ChainInfo,
  safeContractInstance: GnosisSafeContractEthers,
): string => {
  if (!hasSafeFeature(SAFE_FEATURES.SAFE_FALLBACK_HANDLER, safe.version)) {
    return '0x'
  }

  const fallbackHandlerAddress = getFallbackHandlerContractInstance(chain.chainId).getAddress()
  return safeContractInstance.encode('setFallbackHandler', [fallbackHandlerAddress])
}

/**
 * Creates two transactions:
 * - change the mastercopy address
 * - set the fallback handler address
 * Only works for safes < 1.3.0 as the changeMasterCopy function was removed
 */
export const createUpdateSafeTxs = (safe: SafeInfo, chain: ChainInfo): MetaTransactionData[] => {
  assertValidSafeVersion(safe.version)

  const latestMasterCopy = getGnosisSafeContractInstance(chain, LATEST_SAFE_VERSION)
  const safeContractInstance = getGnosisSafeContractInstance(chain, safe.version)

  // @ts-expect-error this was removed in 1.3.0 but we need to support it for older safe versions
  const changeMasterCopyCallData = safeContractInstance.encode('changeMasterCopy', [latestMasterCopy.getAddress()])
  const changeFallbackHandlerCallData = getChangeFallbackHandlerCallData(safe, chain, safeContractInstance)

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
