import { TxModalContext } from '@/components/tx-flow'
import useDeployGasLimit from '@/features/counterfactual/hooks/useDeployGasLimit'
import { removeUndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import { deploySafeAndExecuteTx } from '@/features/counterfactual/utils'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWalletCanPay from '@/hooks/useWalletCanPay'
import useOnboard from '@/hooks/wallets/useOnboard'
import useWallet from '@/hooks/wallets/useWallet'
import { useAppDispatch } from '@/store'
import madProps from '@/utils/mad-props'
import React, { type ReactElement, type SyntheticEvent, useContext, useState } from 'react'
import { CircularProgress, Box, Button, CardActions, Divider } from '@mui/material'
import classNames from 'classnames'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { trackError, Errors } from '@/services/exceptions'
import { useCurrentChain } from '@/hooks/useChains'
import { getTxOptions } from '@/utils/transactions'
import CheckWallet from '@/components/common/CheckWallet'
import { useIsExecutionLoop } from '@/components/tx/SignOrExecuteForm/hooks'
import type { SignOrExecuteProps } from '@/components/tx/SignOrExecuteForm'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import AdvancedParams, { useAdvancedParams } from '@/components/tx/AdvancedParams'
import { asError } from '@/services/exceptions/utils'

import css from '@/components/tx/SignOrExecuteForm/styles.module.css'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import { TxSecurityContext } from '@/components/tx/security/shared/TxSecurityContext'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import NonOwnerError from '@/components/tx/SignOrExecuteForm/NonOwnerError'

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
  const chainId = useChainId()
  const dispatch = useAppDispatch()
  const { safeAddress } = useSafeInfo()

  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const currentChain = useCurrentChain()
  const { needsRiskConfirmation, isRiskConfirmed, setIsRiskIgnored } = txSecurity
  const { setTxFlow } = useContext(TxModalContext)

  // Estimate gas limit
  const { gasLimit, gasLimitError } = useDeployGasLimit(safeTx)
  const [advancedParams, setAdvancedParams] = useAdvancedParams(gasLimit)

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

    const onSuccess = () => {
      dispatch(removeUndeployedSafe({ chainId, address: safeAddress }))
    }

    try {
      await deploySafeAndExecuteTx(txOptions, chainId, wallet, safeTx, onboard, onSuccess)
    } catch (_err) {
      const err = asError(_err)
      trackError(Errors._804, err)
      setIsSubmittable(true)
      setSubmitError(err)
      return
    }

    // TODO: Show a success or status screen
    setTxFlow(undefined)
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
        <div className={classNames(css.params)}>
          <AdvancedParams
            willExecute
            params={advancedParams}
            recommendedGasLimit={gasLimit}
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
          <Box mt={1}>
            <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
          </Box>
        )}

        <Divider className={commonCss.nestedDivider} sx={{ pt: 3 }} />

        <CardActions>
          {/* Submit button */}
          <CheckWallet allowNonOwner={onlyExecute}>
            {(isOk) => (
              <Button variant="contained" type="submit" disabled={!isOk || submitDisabled} sx={{ minWidth: '112px' }}>
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
