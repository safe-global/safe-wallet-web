import { BatchExecuteData } from '@/components/transactions/BatchExecuteButton/index'
import useAsync from '@/hooks/useAsync'
import {
  ChainInfo,
  Erc20Transfer,
  Erc721Transfer,
  getTransactionDetails,
  MultisigConfirmation,
  Operation,
  Transaction,
  TransactionDetails,
  TransactionInfo,
  TransactionTokenType,
} from '@gnosis.pm/safe-react-gateway-sdk'
import { getGnosisSafeContractInstance, getMultiSendCallOnlyContractInstance } from '@/services/contracts/safeContracts'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionDetails } from '@/utils/transaction-guards'
import { EMPTY_DATA } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'
import { getPreValidatedSignature } from '@/hooks/useGasLimit'
import { encodeMultiSendData } from '@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/utils'
import { MetaTransactionData, OperationType } from '@gnosis.pm/safe-core-sdk-types/dist/src/types'
import { useWeb3 } from '@/hooks/wallets/web3'
import { Button } from '@mui/material'

export const getTxRecipient = (txInfo: TransactionInfo, safeAddress: string): string => {
  switch (txInfo.type) {
    case 'Transfer':
      if (txInfo.transferInfo.type === TransactionTokenType.NATIVE_COIN) {
        return txInfo.recipient.value
      } else {
        return (txInfo.transferInfo as Erc20Transfer | Erc721Transfer).tokenAddress
      }
    case 'Custom':
      return txInfo.to.value
    case 'Creation':
    case 'SettingsChange':
    default:
      return safeAddress
  }
}

export const getTxValue = (txInfo: TransactionInfo, txDetails: TransactionDetails): string => {
  switch (txInfo.type) {
    case 'Transfer':
      if (txInfo.transferInfo.type === TransactionTokenType.NATIVE_COIN) {
        return txInfo.transferInfo.value
      } else {
        return txDetails.txData?.value ?? '0'
      }
    case 'Custom':
      return txInfo.value
    case 'Creation':
    case 'SettingsChange':
    default:
      return '0'
  }
}

const getSignatures = (confirmations: MultisigConfirmation[]) => {
  return confirmations.reduce((prev, current) => {
    return prev + current.signature?.slice(2) || getPreValidatedSignature(current.signer.value)
  }, '0x')
}

const getMultiSendTxs = (
  txs: TransactionDetails[],
  chain: ChainInfo,
  safeAddress: string,
  safeVersion: string,
): MetaTransactionData[] => {
  const safeContractInstance = getGnosisSafeContractInstance(chain, safeVersion)

  return txs
    .map((tx) => {
      if (!isMultisigExecutionDetails(tx.detailedExecutionInfo)) return

      const args = {
        to: getTxRecipient(tx.txInfo, safeAddress),
        value: getTxValue(tx.txInfo, tx),
        data: tx.txData?.hexData || EMPTY_DATA,
        operation: tx.txData?.operation || Operation.CALL,
        safeTxGas: tx.detailedExecutionInfo.safeTxGas,
        baseGas: tx.detailedExecutionInfo.baseGas,
        gasPrice: tx.detailedExecutionInfo.gasPrice,
        gasToken: tx.detailedExecutionInfo.gasToken,
        refundReceiver: tx.detailedExecutionInfo.refundReceiver.value,
        signatures: getSignatures(tx.detailedExecutionInfo.confirmations),
      }
      const data = safeContractInstance.interface.encodeFunctionData('execTransaction', [
        args.to,
        args.value,
        args.data,
        args.operation,
        args.safeTxGas,
        args.baseGas,
        args.gasPrice,
        args.gasToken,
        args.refundReceiver,
        args.signatures,
      ])

      return {
        operation: OperationType.Call,
        to: safeAddress,
        value: '0',
        data,
      }
    })
    .filter(Boolean) as MetaTransactionData[]
}

const getTxsWithDetails = (txs: Transaction[], chainId: string) => {
  return Promise.all(
    txs.map(async (tx) => {
      return await getTransactionDetails(chainId, tx.transaction.id)
    }),
  )
}

const ReviewBatchExecute = ({ data, onSubmit }: { data: BatchExecuteData; onSubmit: (data: null) => void }) => {
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()
  const provider = useWeb3()

  const [txsWithDetails, error, loading] = useAsync<TransactionDetails[] | undefined>(async () => {
    if (!chain?.chainId) return

    return getTxsWithDetails(data.txs, chain.chainId)
  }, [data.txs, chain?.chainId])

  const sendTx = () => {
    if (!provider || !txsWithDetails || !chain) return

    const multiSendTxs = getMultiSendTxs(txsWithDetails, chain, safe.address.value, safe.version)
    const data = encodeMultiSendData(multiSendTxs)

    const multiSendContractInstance = getMultiSendCallOnlyContractInstance(chain.chainId)
    multiSendContractInstance.connect(provider.getSigner()).multiSend(data)

    onSubmit(null)
  }

  return (
    <Button onClick={sendTx} disabled={loading}>
      Send
    </Button>
  )
}

export default ReviewBatchExecute
