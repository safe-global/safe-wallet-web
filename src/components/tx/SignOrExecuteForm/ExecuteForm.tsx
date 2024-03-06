import useWalletCanPay from '@/hooks/useWalletCanPay'
import madProps from '@/utils/mad-props'
import { Box, Button, CardActions, CircularProgress, Divider } from '@mui/material'
import classNames from 'classnames'
import { useContext, useState, type ReactElement, type SyntheticEvent } from 'react'

import CheckWallet from '@/components/common/CheckWallet'
import { TxModalContext } from '@/components/tx-flow'
import { SuccessScreenFlow } from '@/components/tx-flow/flows'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { useCurrentChain } from '@/hooks/useChains'
import useGasLimit from '@/hooks/useGasLimit'
import useIsValidExecution from '@/hooks/useIsValidExecution'
import { useRelaysBySafe } from '@/hooks/useRemainingRelays'
import useWalletCanRelay from '@/hooks/useWalletCanRelay'
import { Errors, trackError } from '@/services/exceptions'
import { asError } from '@/services/exceptions/utils'
import { hasRemainingRelays } from '@/utils/relaying'
import { getTxOptions } from '@/utils/transactions'
import { isWalletRejection } from '@/utils/wallets'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { SignOrExecuteProps } from '.'
import AdvancedParams, { useAdvancedParams } from '../AdvancedParams'
import { ExecutionMethod, ExecutionMethodSelector } from '../ExecutionMethodSelector'
import { useIsExecutionLoop, useTxActions } from './hooks'

import commonCss from '@/components/tx-flow/common/styles.module.css'
import NonOwnerError from '@/components/tx/SignOrExecuteForm/NonOwnerError'
import WalletRejectionError from '@/components/tx/SignOrExecuteForm/WalletRejectionError'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { TxSecurityContext } from '../security/shared/TxSecurityContext'
import css from './styles.module.css'

export const ExecuteForm = ({
  safeTx,
  txId,
  onSubmit,
  disableSubmit = false,
  origin,
  onlyExecute,
  isCreation,
  isOwner,
  isExecutionLoop,
  relays,
  txActions,
  txSecurity,
}: SignOrExecuteProps & {
  isOwner: ReturnType<typeof useIsSafeOwner>
  isExecutionLoop: ReturnType<typeof useIsExecutionLoop>
  relays: ReturnType<typeof useRelaysBySafe>
  txActions: ReturnType<typeof useTxActions>
  txSecurity: ReturnType<typeof useTxSecurityContext>
  safeTx?: SafeTransaction
}): ReactElement => {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const [isRejectedByUser, setIsRejectedByUser] = useState<Boolean>(false)

  // Hooks
  const currentChain = useCurrentChain()
  const { executeTx } = txActions
  const { setTxFlow } = useContext(TxModalContext)
  const { needsRiskConfirmation, isRiskConfirmed, setIsRiskIgnored } = txSecurity

  // We default to relay, but the option is only shown if we canRelay
  const [executionMethod, setExecutionMethod] = useState(ExecutionMethod.RELAY)

  // SC wallets can relay fully signed transactions
  const [walletCanRelay] = useWalletCanRelay(safeTx)

  // The transaction can/will be relayed
  const canRelay = walletCanRelay && hasRemainingRelays(relays[0])
  const willRelay = canRelay && executionMethod === ExecutionMethod.RELAY

  // Estimate gas limit
  const { gasLimit, gasLimitError } = useGasLimit(safeTx)
  const [advancedParams, setAdvancedParams] = useAdvancedParams(gasLimit)

  // Check if transaction will fail
  const { executionValidationError } = useIsValidExecution(safeTx, advancedParams.gasLimit)

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()

    if (needsRiskConfirmation && !isRiskConfirmed) {
      setIsRiskIgnored(true)
      return
    }

    setIsSubmittable(false)
    setSubmitError(undefined)
    setIsRejectedByUser(false)

    const txOptions = getTxOptions(advancedParams, currentChain)

    let executedTxId: string
    try {
      executedTxId = await executeTx(txOptions, safeTx, txId, origin, willRelay)
    } catch (_err) {
      const err = asError(_err)
      if (isWalletRejection(err)) {
        setIsRejectedByUser(true)
      } else {
        trackError(Errors._804, err)
        setSubmitError(err)
      }
      setIsSubmittable(true)
      return
    }

    // On success
    onSubmit?.(executedTxId, true)
    setTxFlow(<SuccessScreenFlow txId={executedTxId} />, undefined, false)
  }

  const walletCanPay = useWalletCanPay({
    gasLimit,
    maxFeePerGas: advancedParams.maxFeePerGas,
    maxPriorityFeePerGas: advancedParams.maxPriorityFeePerGas,
  })

  const cannotPropose = !isOwner && !onlyExecute
  const submitDisabled =
    !safeTx ||
    !isSubmittable ||
    disableSubmit ||
    isExecutionLoop ||
    cannotPropose ||
    (needsRiskConfirmation && !isRiskConfirmed)

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div data-sid="24010" className={classNames(css.params, { [css.noBottomBorderRadius]: canRelay })}>
          <AdvancedParams
            willExecute
            params={advancedParams}
            recommendedGasLimit={gasLimit}
            onFormSubmit={setAdvancedParams}
            gasLimitError={gasLimitError}
            willRelay={willRelay}
          />

          {canRelay && (
            <div data-sid="61829" className={css.noTopBorder}>
              <ExecutionMethodSelector
                executionMethod={executionMethod}
                setExecutionMethod={setExecutionMethod}
                relays={relays[0]}
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
        ) : !walletCanPay && !willRelay ? (
          <ErrorMessage>Your connected wallet doesn&apos;t have enough funds to execute this transaction.</ErrorMessage>
        ) : (
          (executionValidationError || gasLimitError) && (
            <ErrorMessage error={executionValidationError || gasLimitError}>
              This transaction will most likely fail.
              {` To save gas costs, ${isCreation ? 'avoid creating' : 'reject'} this transaction.`}
            </ErrorMessage>
          )
        )}

        {submitError && (
          <Box data-sid="96223" mt={1}>
            <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
          </Box>
        )}

        {isRejectedByUser && (
          <Box data-sid="81211" mt={1}>
            <WalletRejectionError />
          </Box>
        )}

        <Divider className={commonCss.nestedDivider} sx={{ pt: 3 }} />

        <CardActions>
          {/* Submit button */}
          <CheckWallet allowNonOwner={onlyExecute}>
            {(isOk) => (
              <Button
                data-sid="45170"
                variant="contained"
                type="submit"
                disabled={!isOk || submitDisabled}
                sx={{ minWidth: '112px' }}
              >
                {!isSubmittable ? <CircularProgress size={20} /> : 'Execute'}
              </Button>
            )}
          </CheckWallet>
        </CardActions>
      </form>
    </>
  )
}

const useTxSecurityContext = () => useContext(TxSecurityContext)

export default madProps(ExecuteForm, {
  isOwner: useIsSafeOwner,
  isExecutionLoop: useIsExecutionLoop,
  relays: useRelaysBySafe,
  txActions: useTxActions,
  txSecurity: useTxSecurityContext,
})
