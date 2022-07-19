import { MetaTransactionData, OperationType } from '@gnosis.pm/safe-core-sdk-types'
import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { getFallbackHandlerContractInstance, getGnosisSafeContractInstance } from '@/services/safeContracts'

export const CHANGE_MASTER_COPY_ABI = 'function changeMasterCopy(address _masterCopy)'
export const CHANGE_FALLBACK_HANDLER_ABI = 'function setFallbackHandler(address handler)'

/**
 * Creates two transactions:
 * - change the mastercopy address
 * - set the fallback handler address
 * Only works for safes < 1.3.0 as the changeMasterCopy function was removed
 */
export const createUpdateSafeTxs = (safeAddress: string, chain: ChainInfo): MetaTransactionData[] => {
  const safeContractInstance = getGnosisSafeContractInstance(chain)
  const safeContractInterface = safeContractInstance.interface
  // @ts-expect-error this was removed in 1.3.0 but we need to support it for older safe versions
  const changeMasterCopyCallData = safeContractInterface.encodeFunctionData('changeMasterCopy', [
    safeContractInstance.address,
  ])

  const fallbackHandlerAddress = getFallbackHandlerContractInstance(chain.chainId).address
  const changeFallbackHandlerCallData = safeContractInterface.encodeFunctionData('setFallbackHandler', [
    fallbackHandlerAddress,
  ])

  const txs: MetaTransactionData[] = [
    {
      to: safeAddress,
      value: '0',
      data: changeMasterCopyCallData,
      operation: OperationType.Call,
    },
    {
      to: safeAddress,
      value: '0',
      data: changeFallbackHandlerCallData,
      operation: OperationType.Call,
    },
  ]

  return txs
}
