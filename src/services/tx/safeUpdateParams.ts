import type { SafeContractImplementationType } from '@safe-global/protocol-kit/dist/src/types/contracts'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import type { ChainInfo, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { getReadOnlyFallbackHandlerContract, getReadOnlyGnosisSafeContract } from '@/services/contracts/safeContracts'
import { assertValidSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'
import { SAFE_FEATURES } from '@safe-global/protocol-kit/dist/src/utils/safeVersions'
import { hasSafeFeature } from '@/utils/safe-versions'
import { getLatestSafeVersion } from '@/utils/chains'

const getChangeFallbackHandlerCallData = async (
  safe: SafeInfo,
  safeContractInstance: SafeContractImplementationType,
  chain: ChainInfo,
): Promise<string> => {
  if (!hasSafeFeature(SAFE_FEATURES.SAFE_FALLBACK_HANDLER, safe.version)) {
    return '0x'
  }

  const fallbackHandlerAddress = await (
    await getReadOnlyFallbackHandlerContract(getLatestSafeVersion(chain))
  ).getAddress()
  // @ts-ignore
  return safeContractInstance.encode('setFallbackHandler', [fallbackHandlerAddress])
}

/**
 * Creates two transactions:
 * - change the mastercopy address
 * - set the fallback handler address
 * Only works for safes < 1.3.0 as the changeMasterCopy function was removed
 */
export const createUpdateSafeTxs = async (safe: SafeInfo, chain: ChainInfo): Promise<MetaTransactionData[]> => {
  assertValidSafeVersion(safe.version)

  const latestMasterCopyAddress = await (
    await getReadOnlyGnosisSafeContract(chain, getLatestSafeVersion(chain))
  ).getAddress()
  const readOnlySafeContract = await getReadOnlyGnosisSafeContract(chain, safe.version)

  // @ts-expect-error this was removed in 1.3.0 but we need to support it for older safe versions
  const changeMasterCopyCallData = readOnlySafeContract.encode('changeMasterCopy', [latestMasterCopyAddress])
  const changeFallbackHandlerCallData = await getChangeFallbackHandlerCallData(safe, readOnlySafeContract, chain)

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
