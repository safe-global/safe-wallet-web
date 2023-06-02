import { type ReactElement, type SyntheticEvent, useState, useContext } from 'react'
import { Box, Button } from '@mui/material'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { logError, Errors } from '@/services/exceptions'
import { useCurrentChain } from '@/hooks/useChains'
import { getTxOptions } from '@/utils/transactions'
import useIsValidExecution from '@/hooks/useIsValidExecution'
import CheckWallet from '@/components/common/CheckWallet'
import { useImmediatelyExecutable, useIsExecutionLoop, useTxActions } from './hooks'
import UnknownContractError from './UnknownContractError'
import { useRelaysBySafe } from '@/hooks/useRemainingRelays'
import useWalletCanRelay from '@/hooks/useWalletCanRelay'
import { ExecutionMethod, ExecutionMethodSelector } from '../ExecutionMethodSelector'
import { hasRemainingRelays } from '@/utils/relaying'
import type { SignOrExecuteProps } from '.'
import type { AdvancedParameters } from '../AdvancedParams'
import { ModalContext, ModalType } from '@/components/TxFlow/ModalProvider'

const ExecuteForm = ({
  safeTx,
  txId,
  onSubmit,
  children,
  isExecutable = false,
  isRejection = false,
  disableSubmit = false,
  origin,
  advancedParams,
  ...props
}: SignOrExecuteProps & { advancedParams: AdvancedParameters }): ReactElement => {
  //
  // Hooks & variables
  //
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const currentChain = useCurrentChain()
  const { executeTx } = useTxActions()
  const [relays] = useRelaysBySafe()

  // Check that the transaction is executable
  const isCreation = !txId
  const isNewExecutableTx = useImmediatelyExecutable() && isCreation
  const isExecutionLoop = useIsExecutionLoop()

  // We default to relay, but the option is only shown if we canRelay
  const [executionMethod, setExecutionMethod] = useState(ExecutionMethod.RELAY)

  // SC wallets can relay fully signed transactions
  const [walletCanRelay] = useWalletCanRelay(safeTx)

  // The transaction can/will be relayed
  const canRelay = walletCanRelay && hasRemainingRelays(relays)
  const willRelay = canRelay && executionMethod === ExecutionMethod.RELAY

  // Check if transaction will fail
  const { executionValidationError, isValidExecutionLoading } = useIsValidExecution(safeTx, advancedParams.gasLimit)

  const { setVisibleModal } = useContext(ModalContext)

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    setIsSubmittable(false)
    setSubmitError(undefined)

    const txOptions = getTxOptions(advancedParams, currentChain)

    try {
      const executedTxId = await executeTx(txOptions, safeTx, txId, origin, willRelay)

      setVisibleModal({ type: ModalType.SuccessScreen, props: { txId: executedTxId } })
    } catch (err) {
      logError(Errors._804, (err as Error).message)
      setIsSubmittable(true)
      setSubmitError(err as Error)
      return
    }

    onSubmit()
  }

  const submitDisabled = !safeTx || !isSubmittable || disableSubmit || isValidExecutionLoading || isExecutionLoop

  const error = props.error || executionValidationError

  return (
    <form onSubmit={handleSubmit}>
      {canRelay && (
        <Box mb={2}>
          <ExecutionMethodSelector
            executionMethod={executionMethod}
            setExecutionMethod={setExecutionMethod}
            relays={relays}
          />
        </Box>
      )}

      {/* Error messages */}
      {isExecutionLoop ? (
        <ErrorMessage>
          Cannot execute a transaction from the Safe Account itself, please connect a different account.
        </ErrorMessage>
      ) : error ? (
        <ErrorMessage error={error}>
          This transaction will most likely fail.{' '}
          {isNewExecutableTx
            ? 'To save gas costs, avoid creating the transaction.'
            : 'To save gas costs, reject this transaction.'}
        </ErrorMessage>
      ) : submitError ? (
        <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
      ) : (
        <UnknownContractError />
      )}

      {/* Submit button */}
      <CheckWallet allowNonOwner={true}>
        {(isOk) => (
          <Button variant="contained" type="submit" disabled={!isOk || submitDisabled}>
            Submit
          </Button>
        )}
      </CheckWallet>
    </form>
  )
}

export default ExecuteForm
