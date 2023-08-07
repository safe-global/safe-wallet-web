import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import type GnosisSafeContractEthers from '@safe-global/safe-ethers-lib/dist/src/contracts/GnosisSafe/GnosisSafeContractEthers'
import type { ChainInfo, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { getFallbackHandlerContract, getGnosisSafeContract } from '@/services/contracts/safeContracts'
import type { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { assertValidSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'
import { SAFE_FEATURES } from '@safe-global/safe-core-sdk-utils'
import { hasSafeFeature } from '@/utils/safe-versions'

const getChangeFallbackHandlerCallData = (
  safe: SafeInfo,
  chain: ChainInfo,
  safeContractInstance: GnosisSafeContractEthers,
  provider: JsonRpcProvider | Web3Provider,
): string => {
  if (!hasSafeFeature(SAFE_FEATURES.SAFE_FALLBACK_HANDLER, safe.version)) {
    return '0x'
  }

  const fallbackHandlerAddress = getFallbackHandlerContract(chain.chainId, provider).getAddress()
  return safeContractInstance.encode('setFallbackHandler', [fallbackHandlerAddress])
}

/**
 * Creates two transactions:
 * - change the mastercopy address
 * - set the fallback handler address
 * Only works for safes < 1.3.0 as the changeMasterCopy function was removed
 */
export const createUpdateSafeTxs = (
  safe: SafeInfo,
  chain: ChainInfo,
  provider: JsonRpcProvider | Web3Provider,
): MetaTransactionData[] => {
  assertValidSafeVersion(safe.version)

  const latestMasterCopyAddress = getGnosisSafeContract(chain, provider, LATEST_SAFE_VERSION).getAddress()
  const safeContract = getGnosisSafeContract(chain, provider, safe.version)

  // @ts-expect-error this was removed in 1.3.0 but we need to support it for older safe versions
  const changeMasterCopyCallData = safeContract.encode('changeMasterCopy', [latestMasterCopyAddress])
  const changeFallbackHandlerCallData = getChangeFallbackHandlerCallData(safe, chain, safeContract, provider)

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
