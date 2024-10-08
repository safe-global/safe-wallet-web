import type { OperationType } from '@safe-global/safe-core-sdk-types'
import { type SafeTransactionData } from '@safe-global/safe-core-sdk-types'
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { Operation } from '@safe-global/safe-gateway-typescript-sdk'
import { isMultisigDetailedExecutionInfo, isNativeTokenTransfer } from '@/utils/transaction-guards'

const ZERO_ADDRESS: string = '0x0000000000000000000000000000000000000000'
const EMPTY_DATA: string = '0x'

/**
 * Convert the CGW tx type to a Safe Core SDK tx
 */
const extractTxInfo = (
  txDetails: TransactionDetails,
  safeAddress: string,
): { txParams: SafeTransactionData; signatures: Record<string, string> } => {
  // Format signatures into a map
  let signatures: Record<string, string> = {}
  if (isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo)) {
    signatures = txDetails.detailedExecutionInfo.confirmations.reduce((result, item) => {
      result[item.signer.value] = item.signature ?? ''
      return result
    }, signatures)
  }

  const data = txDetails.txData?.hexData ?? EMPTY_DATA

  const baseGas = isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo)
    ? txDetails.detailedExecutionInfo.baseGas
    : '0'

  const gasPrice = isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo)
    ? txDetails.detailedExecutionInfo.gasPrice
    : '0'

  const safeTxGas = isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo)
    ? txDetails.detailedExecutionInfo.safeTxGas
    : '0'

  const gasToken = isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo)
    ? txDetails.detailedExecutionInfo.gasToken
    : ZERO_ADDRESS

  const nonce = isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo)
    ? txDetails.detailedExecutionInfo.nonce
    : 0

  const refundReceiver = isMultisigDetailedExecutionInfo(txDetails.detailedExecutionInfo)
    ? txDetails.detailedExecutionInfo.refundReceiver.value
    : ZERO_ADDRESS

  const value = (() => {
    switch (txDetails.txInfo.type) {
      case 'Transfer':
        if (isNativeTokenTransfer(txDetails.txInfo.transferInfo)) {
          return txDetails.txInfo.transferInfo.value
        } else {
          return txDetails.txData?.value ?? '0'
        }
      case 'TwapOrder':
        return txDetails.txData?.value ?? '0'
      case 'SwapOrder':
        return txDetails.txData?.value ?? '0'
      case 'NativeStakingDeposit':
      case 'NativeStakingValidatorsExit':
      case 'NativeStakingWithdraw':
        return txDetails.txData?.value ?? '0'
      case 'Custom':
        return txDetails.txInfo.value
      case 'Creation':
      case 'SettingsChange':
        return '0'
      default: {
        throw new Error(`Unknown transaction type: ${txDetails.txInfo.type}`)
      }
    }
  })()

  const to = (() => {
    switch (txDetails.txInfo.type) {
      case 'Transfer':
        if (isNativeTokenTransfer(txDetails.txInfo.transferInfo)) {
          return txDetails.txInfo.recipient.value
        } else {
          return txDetails.txInfo.transferInfo.tokenAddress
        }
      case 'SwapOrder':
      case 'TwapOrder':
        const orderTo = txDetails.txData?.to.value
        if (!orderTo) {
          throw new Error('Order tx data does not have a `to` field')
        }
        return orderTo
      case 'NativeStakingDeposit':
      case 'NativeStakingValidatorsExit':
      case 'NativeStakingWithdraw':
        const stakingTo = txDetails.txData?.to.value
        if (!stakingTo) {
          throw new Error('Staking tx data does not have a `to` field')
        }
        return stakingTo
      case 'Custom':
        return txDetails.txInfo.to.value
      case 'Creation':
      case 'SettingsChange':
        return safeAddress
      default: {
        throw new Error(`Unknown transaction type: ${txDetails.txInfo.type}`)
      }
    }
  })()

  const operation = (txDetails.txData?.operation ?? Operation.CALL) as unknown as OperationType

  return {
    txParams: {
      data,
      baseGas,
      gasPrice,
      safeTxGas,
      gasToken,
      nonce,
      refundReceiver,
      value,
      to,
      operation,
    },
    signatures,
  }
}

export default extractTxInfo
