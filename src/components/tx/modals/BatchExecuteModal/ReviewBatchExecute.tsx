import useAsync from '@/hooks/useAsync'
import { ChainInfo, getTransactionDetails, Transaction, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { getGnosisSafeContractInstance, getMultiSendCallOnlyContractInstance } from '@/services/contracts/safeContracts'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionDetails } from '@/utils/transaction-guards'
import { encodeMultiSendData } from '@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/utils'
import { MetaTransactionData, OperationType } from '@gnosis.pm/safe-core-sdk-types/dist/src/types'
import { useWeb3 } from '@/hooks/wallets/web3'
import { Button, DialogContent, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useEffect, useState } from 'react'
import { Multi_send_call_only } from '@/types/contracts/Multi_send_call_only'
import { createExistingTx } from '@/services/tx/txSender'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { Errors, logError } from '@/services/exceptions'
import ErrorMessage from '@/components/tx/ErrorMessage'
import extractTxInfo from '@/services/tx/extractTxInfo'
import { BatchExecuteData } from '@/components/tx/modals/BatchExecuteModal/index'
import DecodedTxs from '@/components/tx/modals/BatchExecuteModal/DecodedTxs'

const getSignatures = (confirmations: Record<string, string>) => {
  return Object.entries(confirmations)
    .filter(([_, signature]) => Boolean(signature))
    .sort(([signerA, _], [signerB, __]) => signerA.toLowerCase().localeCompare(signerB.toLowerCase()))
    .reduce((prev, [_, signature]) => {
      return prev + signature.slice(2)
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

      const args = extractTxInfo(tx, safeAddress)
      const sigs = getSignatures(args.signatures)

      const data = safeContractInstance.interface.encodeFunctionData('execTransaction', [
        args.txParams.to,
        args.txParams.value,
        args.txParams.data,
        args.txParams.operation,
        args.txParams.safeTxGas,
        args.txParams.baseGas,
        args.txParams.gasPrice,
        args.txParams.gasToken,
        args.txParams.refundReceiver,
        sigs,
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
  const [multiSendTxData, setMultiSendTxData] = useState<string>()
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()
  const provider = useWeb3()

  const [txsWithDetails, error, loading] = useAsync<TransactionDetails[] | undefined>(async () => {
    if (!chain?.chainId) return

    return getTxsWithDetails(data.txs, chain.chainId)
  }, [data.txs, chain?.chainId])

  useEffect(() => {
    if (!chain) return

    setMultiSendContract(getMultiSendCallOnlyContractInstance(chain.chainId))
  }, [chain])

  useEffect(() => {
    if (!txsWithDetails || !chain) return

    const multiSendTxs = getMultiSendTxs(txsWithDetails, chain, safe.address.value, safe.version)
    const data = encodeMultiSendData(multiSendTxs)

    setMultiSendTxData(data)
  }, [chain, safe.address.value, safe.version, txsWithDetails])

  const sendTx = async () => {
    setSubmitError(undefined)
    if (!provider || !multiSendTxData || !chain || !multiSendContract || !txsWithDetails) return

    try {
      const multiSendTransaction = await multiSendContract.connect(provider.getSigner()).multiSend(multiSendTxData)

      txsWithDetails.forEach((tx) => {
        createExistingTx(chain.chainId, safe.address.value, tx.txId, tx).then((safeTx) =>
          txDispatch(TxEvent.MINING, { txId: tx.txId, txHash: multiSendTransaction.hash, tx: safeTx }),
        )
      })

      onSubmit(null)
    } catch (err) {
      logError(Errors._804, (err as Error).message)
      setSubmitError(err as Error)
    }
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
        <Typography color="secondary.light">Interact with:</Typography>
        {multiSendContract && (
          <EthHashInfo address={multiSendContract.address} shortAddress={false} hasExplorer showCopyButton />
        )}
        {multiSendTxData && (
          <>
            <Typography mt={2} color="secondary.light">
              Data (hex encoded)
            </Typography>
            {generateDataRowValue(multiSendTxData, 'rawData')}
          </>
        )}
        <DecodedTxs txs={txsWithDetails} numberOfTxs={data.txs.length} />
        <Typography variant="body2" mt={2} textAlign="center">
          Be aware that if any of the included transactions revert, none of them will be executed. This will result in
          the loss of the allocated transaction fees.
        </Typography>
        {error && (
          <ErrorMessage error={error}>
            This transaction will most likely fail. To save gas costs, avoid creating the transaction.
          </ErrorMessage>
        )}
        {submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )}
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
