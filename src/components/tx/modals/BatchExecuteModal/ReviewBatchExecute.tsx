import useAsync from '@/hooks/useAsync'
import { TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { getMultiSendCallOnlyContractInstance } from '@/services/contracts/safeContracts'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { encodeMultiSendData } from '@gnosis.pm/safe-core-sdk/dist/src/utils/transactions/utils'
import { useWeb3 } from '@/hooks/wallets/web3'
import { Button, DialogContent, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useMemo, useState } from 'react'
import { dispatchBatchExecution } from '@/services/tx/txSender'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { Errors, logError } from '@/services/exceptions'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { BatchExecuteData } from '@/components/tx/modals/BatchExecuteModal/index'
import DecodedTxs from '@/components/tx/modals/BatchExecuteModal/DecodedTxs'
import { getMultiSendTxs, getTxsWithDetails } from '@/utils/transactions'
import { getMultiSendSimulationTx } from '@/components/tx/TxSimulation/utils'
import { TxSimulation, type TxSimulationProps } from '@/components/tx/TxSimulation'

const ReviewBatchExecute = ({ data, onSubmit }: { data: BatchExecuteData; onSubmit: (data: null) => void }) => {
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()
  const provider = useWeb3()

  const [txsWithDetails, error, loading] = useAsync<TransactionDetails[]>(() => {
    if (!chain?.chainId) return

    return getTxsWithDetails(data.txs, chain.chainId)
  }, [data.txs, chain?.chainId])

  const multiSendContract = useMemo(() => {
    if (!chain) return
    return getMultiSendCallOnlyContractInstance(chain.chainId)
  }, [chain])

  const multiSendTxData = useMemo(() => {
    if (!txsWithDetails || !chain) return

    const multiSendTxs = getMultiSendTxs(txsWithDetails, chain, safe.address.value, safe.version)
    return encodeMultiSendData(multiSendTxs)
  }, [chain, safe.address.value, safe.version, txsWithDetails])

  const canSimulate = multiSendContract && multiSendTxData
  const getMultiSendData: TxSimulationProps['getTx'] = () => {
    if (!canSimulate) {
      return
    }

    return {
      to: multiSendContract.address,
      data: getMultiSendSimulationTx({ chainId: safe.chainId, multiSendTxData }),
    }
  }

  const onExecute = async () => {
    if (!provider || !multiSendTxData || !multiSendContract || !txsWithDetails) return

    setIsSubmittable(false)
    setSubmitError(undefined)

    try {
      await dispatchBatchExecution(txsWithDetails, multiSendContract, multiSendTxData, provider)
    } catch (err) {
      logError(Errors._804, (err as Error).message)
      setIsSubmittable(true)
      setSubmitError(err as Error)
    }

    onSubmit(null)
  }

  const submitDisabled = loading || !isSubmittable

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

        <Typography mt={2} color="secondary.light">
          Batched transactions:
        </Typography>
        <DecodedTxs txs={txsWithDetails} numberOfTxs={data.txs.length} />

        {multiSendContract && canSimulate && (
          <TxSimulation canExecute getTx={getMultiSendData} disabled={submitDisabled} />
        )}

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
          onClick={onExecute}
          disabled={submitDisabled}
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
