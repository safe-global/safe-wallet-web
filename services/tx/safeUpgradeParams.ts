import { getSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { MetaTransactionData, OperationType } from '@gnosis.pm/safe-core-sdk-types'
import { ethers } from 'ethers'
import { encodeMultiSendCall } from './multisend'

const CHANGE_MASTER_COPY_ABI = 'function changeMasterCopy(address _masterCopy)'
const CHANGE_FALLBACK_HANDLER_ABI = 'function setFallbackHandler(address handler)'

/**
 * Creates multisend tx params which changes the safes mastercopy and fallback handler
 * Only works for safes < 1.3.0 as the changeMasterCopy function was removed
 */
export const createSafeUpgradeParams = (
  safeAddress: string,
  latestMasterCopyAddress: string,
  fallbackHandlerAddress: string,
): MetaTransactionData => {
  const safeSDK = getSafeSDK()

  if (!safeSDK) {
    throw Error('No safe SDK available!')
  }

  const safeContractInterface = new ethers.utils.Interface([CHANGE_MASTER_COPY_ABI, CHANGE_FALLBACK_HANDLER_ABI])
  const changeMasterCopyCallData = safeContractInterface.encodeFunctionData('changeMasterCopy', [
    latestMasterCopyAddress,
  ])
  const changeFallbackHandlerCallData = safeContractInterface.encodeFunctionData('setFallbackHandler', [
    fallbackHandlerAddress,
  ])
  const txs = [
    {
      to: safeAddress,
      value: '0',
      data: changeMasterCopyCallData,
    },
    {
      to: safeAddress,
      value: '0',
      data: changeFallbackHandlerCallData,
    },
  ]

  return {
    to: safeSDK.getMultiSendAddress(),
    data: encodeMultiSendCall(txs),
    value: '0',
    operation: OperationType.DelegateCall,
  }
}
