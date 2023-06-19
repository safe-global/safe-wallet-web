import { type ReactElement, type SyntheticEvent, useContext, useState } from 'react'
import { Button, CardActions } from '@mui/material'
import classNames from 'classnames'

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
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { TxModalContext } from '@/components/tx-flow'
import { SuccessScreen } from '@/components/tx-flow/flows/SuccessScreen'
import useGasLimit from '@/hooks/useGasLimit'
import AdvancedParams, { useAdvancedParams } from '../AdvancedParams'

import css from './styles.module.css'

const ExecuteForm = ({
  safeTx,
  txId,
  onSubmit,
  disableSubmit = false,
  origin,
}: SignOrExecuteProps & {
  safeTx?: SafeTransaction
}): ReactElement => {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const currentChain = useCurrentChain()
  const { executeTx } = useTxActions()
  const [relays] = useRelaysBySafe()
  const { setTxFlow } = useContext(TxModalContext)

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

  // Estimate gas limit
  const { gasLimit, gasLimitError } = useGasLimit(safeTx)
  const [advancedParams, setAdvancedParams] = useAdvancedParams(gasLimit)

  // Check if transaction will fail
  const { executionValidationError, isValidExecutionLoading } = useIsValidExecution(safeTx, advancedParams.gasLimit)

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    setIsSubmittable(false)
    setSubmitError(undefined)

    const txOptions = getTxOptions(advancedParams, currentChain)

    try {
      const executedTxId = await executeTx(txOptions, safeTx, txId, origin, willRelay)
      setTxFlow(<SuccessScreen txId={executedTxId} />)
    } catch (err) {
      logError(Errors._804, (err as Error).message)
      setIsSubmittable(true)
      setSubmitError(err as Error)
      return
    }

    onSubmit()
  }

  const submitDisabled = !safeTx || !isSubmittable || disableSubmit || isValidExecutionLoading || isExecutionLoop

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className={classNames({ [css.noBottomBorderRadius]: canRelay })}>
          <AdvancedParams
            willExecute
            params={advancedParams}
            recommendedGasLimit={gasLimit}
            onFormSubmit={setAdvancedParams}
            gasLimitError={gasLimitError}
            willRelay={willRelay}
          />
        </div>

        {canRelay && (
          <div className={css.noTopBorder}>
            <ExecutionMethodSelector
              executionMethod={executionMethod}
              setExecutionMethod={setExecutionMethod}
              relays={relays}
            />
          </div>
        )}

        {/* Error messages */}
        {isExecutionLoop ? (
          <ErrorMessage>
            Cannot execute a transaction from the Safe Account itself, please connect a different account.
          </ErrorMessage>
        ) : executionValidationError || gasLimitError ? (
          <ErrorMessage error={executionValidationError || gasLimitError}>
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

        <CardActions>
          {/* Submit button */}
          <CheckWallet allowNonOwner={true}>
            {(isOk) => (
              <Button variant="contained" type="submit" disabled={!isOk || submitDisabled}>
                Submit
              </Button>
            )}
          </CheckWallet>
        </CardActions>
      </form>
    </>
  )
}

export default ExecuteForm
