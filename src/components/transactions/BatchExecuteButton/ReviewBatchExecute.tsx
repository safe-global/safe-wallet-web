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
import { encodeMultiSendData } from '@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/utils'
import { MetaTransactionData, OperationType } from '@gnosis.pm/safe-core-sdk-types/dist/src/types'
import { useWeb3 } from '@/hooks/wallets/web3'
import { Button, DialogContent, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useEffect, useState } from 'react'
import { Multi_send_call_only } from '@/types/contracts/Multi_send_call_only'
import { createExistingTx } from '@/services/tx/txSender'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'

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
  return confirmations
    .filter((confirmation) => Boolean(confirmation.signature))
    .sort((a, b) => a.signer.value.toLowerCase().localeCompare(b.signer.value.toLocaleLowerCase()))
    .reduce((prev, current) => {
      return prev + current.signature?.slice(2)
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
  const [multiSendContract, setMultiSendContract] = useState<Multi_send_call_only>()
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()
  const provider = useWeb3()

  useEffect(() => {
    if (!chain) return

    setMultiSendContract(getMultiSendCallOnlyContractInstance(chain.chainId))
  }, [chain])

  const [txsWithDetails, _, loading] = useAsync<TransactionDetails[] | undefined>(async () => {
    if (!chain?.chainId) return

    return getTxsWithDetails(data.txs, chain.chainId)
  }, [data.txs, chain?.chainId])

  const sendTx = async () => {
    if (!provider || !txsWithDetails || !chain || !multiSendContract) return

    const multiSendTxs = getMultiSendTxs(txsWithDetails, chain, safe.address.value, safe.version)
    const multiSendTxData = encodeMultiSendData(multiSendTxs)

    const multisendTransaction = await multiSendContract.connect(provider.getSigner()).multiSend(multiSendTxData)
    data.txs.forEach((tx) => {
      createExistingTx(chain.chainId, safe.address.value, tx.transaction).then((safeTx) =>
        txDispatch(TxEvent.MINING, { txId: tx.transaction.id, txHash: multisendTransaction.hash, tx: safeTx }),
      )
    })

    onSubmit(null)
  }

  return (
    <div>
      <DialogContent>
        <Typography variant="body2" mb={2}>
          This transaction batches a total of {data.txs.length} transactions from your queue into a single Ethereum
          transaction. Please check every included transaction carefully, especially if you have rejection transactions,
          and make sure you want to execute all of them. Included transactions are highlighted in green when you hover
          over the execute button.
        </Typography>
        <Typography>Interact with:</Typography>
        {multiSendContract && (
          <EthHashInfo address={multiSendContract.address} shortAddress={false} hasExplorer showCopyButton />
        )}
        <Typography variant="body2" mt={2} textAlign="center">
          Be aware that if any of the included transactions revert, none of them will be executed. This will result in
          the loss of the allocated transaction fees.
        </Typography>
        <Button
          onClick={sendTx}
          disabled={loading}
          variant="contained"
          sx={{ position: 'absolute', bottom: '24px', right: '24px', zIndex: 1 }}
        >
          Send
        </Button>
      </DialogContent>
    </div>
  )
}

export default ReviewBatchExecute
