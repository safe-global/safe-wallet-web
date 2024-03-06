import { TxModalContext } from '@/components/tx-flow'
import useDeployGasLimit from '@/features/counterfactual/hooks/useDeployGasLimit'
import { deploySafeAndExecuteTx } from '@/features/counterfactual/utils'
import useChainId from '@/hooks/useChainId'
import { getTotalFeeFormatted } from '@/hooks/useGasPrice'
import useWalletCanPay from '@/hooks/useWalletCanPay'
import useOnboard from '@/hooks/wallets/useOnboard'
import useWallet from '@/hooks/wallets/useWallet'
import { OVERVIEW_EVENTS, trackEvent, WALLET_EVENTS } from '@/services/analytics'
import { TX_EVENTS, TX_TYPES } from '@/services/analytics/events/transactions'
import madProps from '@/utils/mad-props'
import { Alert, Box, Button, CardActions, CircularProgress, Divider } from '@mui/material'
import classNames from 'classnames'
import { useContext, useState, type ReactElement, type SyntheticEvent } from 'react'

import CheckWallet from '@/components/common/CheckWallet'
import AdvancedParams, { useAdvancedParams } from '@/components/tx/AdvancedParams'
import ErrorMessage from '@/components/tx/ErrorMessage'
import type { SignOrExecuteProps } from '@/components/tx/SignOrExecuteForm'
import { useIsExecutionLoop } from '@/components/tx/SignOrExecuteForm/hooks'
import { useCurrentChain } from '@/hooks/useChains'
import { Errors, trackError } from '@/services/exceptions'
import { asError } from '@/services/exceptions/utils'
import { getTxOptions } from '@/utils/transactions'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import commonCss from '@/components/tx-flow/common/styles.module.css'
import { TxSecurityContext } from '@/components/tx/security/shared/TxSecurityContext'
import NonOwnerError from '@/components/tx/SignOrExecuteForm/NonOwnerError'
import css from '@/components/tx/SignOrExecuteForm/styles.module.css'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'

export const CounterfactualForm = ({
  safeTx,
  disableSubmit = false,
  onlyExecute,
  isCreation,
  isOwner,
  isExecutionLoop,
  txSecurity,
}: SignOrExecuteProps & {
  isOwner: ReturnType<typeof useIsSafeOwner>
  isExecutionLoop: ReturnType<typeof useIsExecutionLoop>
  txSecurity: ReturnType<typeof useTxSecurityContext>
  safeTx?: SafeTransaction
}): ReactElement => {
  const wallet = useWallet()
  const onboard = useOnboard()
  const chain = useCurrentChain()
  const chainId = useChainId()

  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const currentChain = useCurrentChain()
  const { needsRiskConfirmation, isRiskConfirmed, setIsRiskIgnored } = txSecurity
  const { setTxFlow } = useContext(TxModalContext)

  // Estimate gas limit
  const { gasLimit, gasLimitError } = useDeployGasLimit(safeTx)
  const [advancedParams, setAdvancedParams] = useAdvancedParams(gasLimit?.totalGas)

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
      trackEvent({ ...OVERVIEW_EVENTS.PROCEED_WITH_TX, label: TX_TYPES.activate_with_tx })

      await deploySafeAndExecuteTx(txOptions, chainId, wallet, safeTx, onboard)

      trackEvent({ ...TX_EVENTS.CREATE, label: TX_TYPES.activate_with_tx })
      trackEvent({ ...TX_EVENTS.EXECUTE, label: TX_TYPES.activate_with_tx })
      trackEvent(WALLET_EVENTS.ONCHAIN_INTERACTION)
    } catch (_err) {
      const err = asError(_err)
      trackError(Errors._804, err)
      setIsSubmittable(true)
      setSubmitError(err)
      return
    }

    setTxFlow(undefined)
  }

  const walletCanPay = useWalletCanPay({
    gasLimit: gasLimit?.totalGas,
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
        <Alert severity="info" sx={{ mb: 2, border: 0 }}>
          Executing this transaction will activate your account.
          <br />
          <ul style={{ margin: 0, padding: '4px 16px 0' }}>
            <li>
              Base fee: &asymp;{' '}
              <strong>
                {getTotalFeeFormatted(advancedParams.maxFeePerGas, BigInt(gasLimit?.safeTxGas || '0'), chain)}{' '}
                {chain?.nativeCurrency.symbol}
              </strong>
            </li>
            <li>
              One-time activation fee: &asymp;{' '}
              <strong>
                {getTotalFeeFormatted(advancedParams.maxFeePerGas, BigInt(gasLimit?.safeDeploymentGas || '0'), chain)}{' '}
                {chain?.nativeCurrency.symbol}
              </strong>
            </li>
          </ul>
        </Alert>

        <div data-sid="42983" className={classNames(css.params)}>
          <AdvancedParams
            willExecute
            params={advancedParams}
            recommendedGasLimit={gasLimit?.totalGas}
            onFormSubmit={setAdvancedParams}
            gasLimitError={gasLimitError}
            willRelay={false}
          />
        </div>

        {/* Error messages */}
        {cannotPropose ? (
          <NonOwnerError />
        ) : isExecutionLoop ? (
          <ErrorMessage>
            Cannot execute a transaction from the Safe Account itself, please connect a different account.
          </ErrorMessage>
        ) : !walletCanPay ? (
          <ErrorMessage>Your connected wallet doesn&apos;t have enough funds to execute this transaction.</ErrorMessage>
        ) : (
          gasLimitError && (
            <ErrorMessage error={gasLimitError}>
              This transaction will most likely fail.
              {` To save gas costs, ${isCreation ? 'avoid creating' : 'reject'} this transaction.`}
            </ErrorMessage>
          )
        )}

        {submitError && (
          <Box data-sid="16871" mt={1}>
            <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
          </Box>
        )}

        <Divider className={commonCss.nestedDivider} sx={{ pt: 3 }} />

        <CardActions>
          {/* Submit button */}
          <CheckWallet allowNonOwner={onlyExecute}>
            {(isOk) => (
              <Button
                data-sid="31333"
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

export default madProps(CounterfactualForm, {
  isOwner: useIsSafeOwner,
  isExecutionLoop: useIsExecutionLoop,
  txSecurity: useTxSecurityContext,
})
