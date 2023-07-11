import { Typography, Button, CardActions, Divider, Alert } from '@mui/material'
import { encodeMultiSendData } from '@safe-global/safe-core-sdk/dist/src/utils/transactions/utils'
import { useState, useMemo } from 'react'
import type { SyntheticEvent } from 'react'
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'

import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { ExecutionMethod, ExecutionMethodSelector } from '@/components/tx/ExecutionMethodSelector'
import DecodedTxs from '@/components/tx-flow/flows/ExecuteBatch/DecodedTxs'
import { TxSimulation } from '@/components/tx/security/tenderly'
import { WrongChainWarning } from '@/components/tx/WrongChainWarning'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import { useRelaysBySafe } from '@/hooks/useRemainingRelays'
import useSafeInfo from '@/hooks/useSafeInfo'
import useOnboard from '@/hooks/wallets/useOnboard'
import { useWeb3 } from '@/hooks/wallets/web3'
import { logError, Errors } from '@/services/exceptions'
import { dispatchBatchExecution, dispatchBatchExecutionRelay } from '@/services/tx/tx-sender'
import { hasRemainingRelays } from '@/utils/relaying'
import { getTxsWithDetails, getMultiSendTxs } from '@/utils/transactions'
import { getMultiSendCallOnlyContract } from '@/services/contracts/safeContracts'
import TxCard from '../../common/TxCard'
import CheckWallet from '@/components/common/CheckWallet'
import type { ExecuteBatchFlowProps } from '.'
import { asError } from '@/services/exceptions/utils'
import SendToBlock from '@/components/tx-flow/flows/TokenTransfer/SendToBlock'
import ConfirmationTitle, { ConfirmationTitleTypes } from '@/components/tx/SignOrExecuteForm/ConfirmationTitle'
import commonCss from '@/components/tx-flow/common/styles.module.css'

export const ReviewBatch = ({ params }: { params: ExecuteBatchFlowProps }) => {
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const [executionMethod, setExecutionMethod] = useState(ExecutionMethod.RELAY)
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()
  const [relays] = useRelaysBySafe()

  // Chain has relaying feature and available relays
  const canRelay = hasRemainingRelays(relays)
  const willRelay = canRelay && executionMethod === ExecutionMethod.RELAY
  const onboard = useOnboard()
  const web3 = useWeb3()

  const [txsWithDetails, error, loading] = useAsync<TransactionDetails[]>(() => {
    if (!chain?.chainId) return
    return getTxsWithDetails(params.txs, chain.chainId)
  }, [params.txs, chain?.chainId])

  const multiSendContract = useMemo(() => {
    if (!chain?.chainId || !safe.version || !web3) return
    return getMultiSendCallOnlyContract(chain.chainId, safe.version, web3)
  }, [chain?.chainId, safe.version, web3])

  const multiSendTxs = useMemo(() => {
    if (!txsWithDetails || !chain || !safe.version) return
    return getMultiSendTxs(txsWithDetails, chain, safe.address.value, safe.version)
  }, [chain, safe.address.value, safe.version, txsWithDetails])

  const multiSendTxData = useMemo(() => {
    if (!txsWithDetails || !multiSendTxs) return
    return encodeMultiSendData(multiSendTxs)
  }, [txsWithDetails, multiSendTxs])

  const onExecute = async () => {
    if (!onboard || !multiSendTxData || !multiSendContract || !txsWithDetails) return

    await dispatchBatchExecution(
      txsWithDetails,
      multiSendContract,
      multiSendTxData,
      onboard,
      safe.chainId,
      safe.address.value,
    )
  }

  const onRelay = async () => {
    if (!multiSendTxData || !multiSendContract || !txsWithDetails) return

    await dispatchBatchExecutionRelay(
      txsWithDetails,
      multiSendContract,
      multiSendTxData,
      safe.chainId,
      safe.address.value,
    )
  }

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    setIsSubmittable(false)
    setSubmitError(undefined)

    try {
      await (willRelay ? onRelay() : onExecute())
    } catch (_err) {
      const err = asError(_err)
      logError(Errors._804, err)
      setIsSubmittable(true)
      setSubmitError(err)
      return
    }
  }

  const submitDisabled = loading || !isSubmittable

  return (
    <>
      <TxCard>
        <Typography variant="body2">
          This transaction batches a total of {params.txs.length} transactions from your queue into a single Ethereum
          transaction. Please check every included transaction carefully, especially if you have rejection transactions,
          and make sure you want to execute all of them. Included transactions are highlighted in green when you hover
          over the execute button.
        </Typography>

        {multiSendContract && <SendToBlock address={multiSendContract.getAddress()} title="Interact with:" />}

        {multiSendTxData && (
          <div>
            <Typography variant="body2" color="text.secondary">
              Data (hex encoded)
            </Typography>
            {generateDataRowValue(multiSendTxData, 'rawData')}
          </div>
        )}

        <div>
          <Typography variant="body2" color="text.secondary">
            Batched transactions:
          </Typography>
          <DecodedTxs txs={txsWithDetails} />
        </div>
      </TxCard>

      {multiSendTxs && (
        <TxCard>
          <Typography variant="h5">Transaction checks</Typography>

          <TxSimulation transactions={multiSendTxs} disabled={submitDisabled} />
        </TxCard>
      )}

      <TxCard>
        <ConfirmationTitle variant={ConfirmationTitleTypes.execute} />

        <WrongChainWarning />

        {canRelay ? (
          <>
            <ExecutionMethodSelector
              executionMethod={executionMethod}
              setExecutionMethod={setExecutionMethod}
              relays={relays}
              tooltip="You can only relay multisend transactions containing executions from the same Safe Account."
            />
          </>
        ) : null}

        <Alert severity="warning">
          Be aware that if any of the included transactions revert, none of them will be executed. This will result in
          the loss of the allocated transaction fees.
        </Alert>

        {error && (
          <ErrorMessage error={error}>
            This transaction will most likely fail. To save gas costs, avoid creating the transaction.
          </ErrorMessage>
        )}

        {submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )}

        <div>
          <Divider className={commonCss.nestedDivider} sx={{ pt: 2 }} />

          <CardActions>
            <CheckWallet allowNonOwner={true}>
              {(isOk) => (
                <Button variant="contained" type="submit" disabled={!isOk || submitDisabled} onClick={handleSubmit}>
                  Send
                </Button>
              )}
            </CheckWallet>
          </CardActions>
        </div>
      </TxCard>
    </>
  )
}
