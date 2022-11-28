import type { MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import { OperationType } from '@gnosis.pm/safe-core-sdk-types'
import type { ChainInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { getFallbackHandlerContractInstance, getGnosisSafeContractInstance } from '@/services/contracts/safeContracts'
import { LATEST_SAFE_VERSION } from '@/config/constants'

// TODO: Check if these are still needed
export const CHANGE_MASTER_COPY_ABI = 'function changeMasterCopy(address _masterCopy)'
export const CHANGE_FALLBACK_HANDLER_ABI = 'function setFallbackHandler(address handler)'

/**
 * Creates two transactions:
 * - change the mastercopy address
 * - set the fallback handler address
 * Only works for safes < 1.3.0 as the changeMasterCopy function was removed
 */
export const createUpdateSafeTxs = (safe: SafeInfo, chain: ChainInfo): MetaTransactionData[] => {
  const latestMasterCopy = getGnosisSafeContractInstance(chain, LATEST_SAFE_VERSION)
  const safeContractInstance = getGnosisSafeContractInstance(chain, safe.version)

  // @ts-expect-error this was removed in 1.3.0 but we need to support it for older safe versions
  const changeMasterCopyCallData = safeContractInstance.encode('changeMasterCopy', [latestMasterCopy.getAddress()])

  const fallbackHandlerAddress = getFallbackHandlerContractInstance(chain.chainId).address
  const changeFallbackHandlerCallData = safeContractInstance.encode('setFallbackHandler', [fallbackHandlerAddress])

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
