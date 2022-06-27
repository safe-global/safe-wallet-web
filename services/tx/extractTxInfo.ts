import { OperationType, type SafeTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import {
  Erc20Transfer,
  Erc721Transfer,
  MultisigExecutionInfo,
  Operation,
  TransactionDetails,
  TransactionSummary,
  TransactionTokenType,
} from '@gnosis.pm/safe-react-gateway-sdk'
import { isMultisigExecutionDetails } from '@/utils/transaction-guards'

const ZERO_ADDRESS: string = '0x0000000000000000000000000000000000000000'
const EMPTY_DATA: string = '0x'

/**
 * Convert the CGW tx type to a Safe Core SDK tx
 */
const extractTxInfo = (
  txSummary: TransactionSummary,
  txDetails: TransactionDetails,
  safeAddress: string,
): { txParams: SafeTransactionData; signatures: Record<string, string> } => {
  // Format signatures into a map
  let signatures: Record<string, string> = {}
  if (isMultisigExecutionDetails(txDetails.detailedExecutionInfo)) {
    signatures = txDetails.detailedExecutionInfo.confirmations.reduce((result, item) => {
      result[item.signer.value] = item.signature || ''
      return result
    }, signatures)
  }

  // const safeTxHash = isMultisig(txDetails.detailedExecutionInfo)
  //   ? txDetails.detailedExecutionInfo.safeTxHash
  //   : EMPTY_DATA

  //const origin = txSummary.safeAppInfo ? JSON.stringify({ name: txSummary.safeAppInfo.name, url: txSummary.safeAppInfo.url }) : ''

  const data = txDetails.txData?.hexData ?? EMPTY_DATA

  const baseGas = isMultisigExecutionDetails(txDetails.detailedExecutionInfo)
    ? Number(txDetails.detailedExecutionInfo.baseGas)
    : 0

  const gasPrice = isMultisigExecutionDetails(txDetails.detailedExecutionInfo)
    ? Number(txDetails.detailedExecutionInfo.gasPrice)
    : 0

  const safeTxGas = isMultisigExecutionDetails(txDetails.detailedExecutionInfo)
    ? Number(txDetails.detailedExecutionInfo.safeTxGas)
    : 0

  const gasToken = isMultisigExecutionDetails(txDetails.detailedExecutionInfo)
    ? txDetails.detailedExecutionInfo.gasToken
    : ZERO_ADDRESS

  const nonce = (txSummary.executionInfo as MultisigExecutionInfo)?.nonce ?? 0

  const refundReceiver = isMultisigExecutionDetails(txDetails.detailedExecutionInfo)
    ? txDetails.detailedExecutionInfo.refundReceiver.value
    : ZERO_ADDRESS

  const value = (() => {
    switch (txSummary.txInfo.type) {
      case 'Transfer':
        if (txSummary.txInfo.transferInfo.type === TransactionTokenType.NATIVE_COIN) {
          return txSummary.txInfo.transferInfo.value
        } else {
          return txDetails.txData?.value ?? '0'
        }
      case 'Custom':
        return txSummary.txInfo.value
      case 'Creation':
      case 'SettingsChange':
      default:
        return '0'
    }
  })()

  const to = (() => {
    switch (txSummary.txInfo.type) {
      case 'Transfer':
        if (txSummary.txInfo.transferInfo.type === TransactionTokenType.NATIVE_COIN) {
          return txSummary.txInfo.recipient.value
        } else {
          return (txSummary.txInfo.transferInfo as Erc20Transfer | Erc721Transfer).tokenAddress
        }
      case 'Custom':
        return txSummary.txInfo.to.value
      case 'Creation':
      case 'SettingsChange':
      default:
        return safeAddress
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
