import { type ReactElement, type SyntheticEvent, useContext, useState } from 'react'
import { Box, Button, CardActions, Divider } from '@mui/material'
import classNames from 'classnames'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { trackError, Errors } from '@/services/exceptions'
import { useCurrentChain } from '@/hooks/useChains'
import { getTxOptions } from '@/utils/transactions'
import useIsValidExecution from '@/hooks/useIsValidExecution'
import CheckWallet from '@/components/common/CheckWallet'
import { useIsExecutionLoop, useTxActions } from './hooks'
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
import { asError } from '@/services/exceptions/utils'

import css from './styles.module.css'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import { TxSecurityContext } from '../security/shared/TxSecurityContext'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import NonOwnerError from '@/components/tx/SignOrExecuteForm/NonOwnerError'
import { useAppSelector } from '@/store'
import { selectQueuedTransactionById } from '@/store/txQueueSlice'

const ExecuteForm = ({
  safeTx,
  txId,
  onSubmit,
  disableSubmit = false,
  origin,
  onlyExecute,
  isCreation,
}: SignOrExecuteProps & {
  safeTx?: SafeTransaction
}): ReactElement => {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const isOwner = useIsSafeOwner()
  const currentChain = useCurrentChain()
  const { executeTx } = useTxActions()
  const [relays] = useRelaysBySafe()
  const { setTxFlow } = useContext(TxModalContext)
  const { needsRiskConfirmation, isRiskConfirmed, setIsRiskIgnored } = useContext(TxSecurityContext)

  const tx = useAppSelector((state) => selectQueuedTransactionById(state, txId))

  // Check that the transaction is executable
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

    if (needsRiskConfirmation && !isRiskConfirmed) {
      setIsRiskIgnored(true)
      return
    }

    setIsSubmittable(false)
    setSubmitError(undefined)

    const txOptions = getTxOptions(advancedParams, currentChain)

    try {
      const executedTxId = await executeTx(txOptions, safeTx, txId, origin, willRelay, tx)
      setTxFlow(<SuccessScreen txId={executedTxId} />, undefined, false)
    } catch (_err) {
      const err = asError(_err)
      trackError(Errors._804, err)
      setIsSubmittable(true)
      setSubmitError(err)
      return
    }

    onSubmit()
  }

  const cannotPropose = !isOwner && !onlyExecute
  const submitDisabled =
    !safeTx || !isSubmittable || disableSubmit || isValidExecutionLoading || isExecutionLoop || cannotPropose

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className={classNames(css.params, { [css.noBottomBorderRadius]: canRelay })}>
          <AdvancedParams
            willExecute
            params={advancedParams}
            recommendedGasLimit={gasLimit}
            onFormSubmit={setAdvancedParams}
            gasLimitError={gasLimitError}
            willRelay={willRelay}
          />

          {canRelay && (
            <div className={css.noTopBorder}>
              <ExecutionMethodSelector
                executionMethod={executionMethod}
                setExecutionMethod={setExecutionMethod}
                relays={relays}
              />
            </div>
          )}
        </div>

        {/* Error messages */}
        {cannotPropose ? (
          <NonOwnerError />
        ) : isExecutionLoop ? (
          <ErrorMessage>
            Cannot execute a transaction from the Safe Account itself, please connect a different account.
          </ErrorMessage>
        ) : (
          (executionValidationError || gasLimitError) && (
            <ErrorMessage error={executionValidationError || gasLimitError}>
              This transaction will most likely fail.
              {` To save gas costs, ${isCreation ? 'avoid creating' : 'reject'} this transaction.`}
            </ErrorMessage>
          )
        )}

        {submitError && (
          <Box mt={1}>
            <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
          </Box>
        )}

        <Divider className={commonCss.nestedDivider} sx={{ pt: 3 }} />

        <CardActions>
          {/* Submit button */}
          <CheckWallet allowNonOwner={onlyExecute}>
            {(isOk) => (
              <Button variant="contained" type="submit" disabled={!isOk || submitDisabled}>
                Execute
              </Button>
            )}
          </CheckWallet>
        </CardActions>
      </form>
    </>
  )
}

export default ExecuteForm
