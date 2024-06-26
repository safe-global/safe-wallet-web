import { TxModalContext } from '@/components/tx-flow'
import { signAndExecuteUserOperation, signAndProposeUserOperation } from '@/features/counterfactual/utils'
import useChainId from '@/hooks/useChainId'
import { getTotalFeeFormatted } from '@/hooks/useGasPrice'
import useOnboard from '@/hooks/wallets/useOnboard'
import { OVERVIEW_EVENTS, trackEvent, WALLET_EVENTS } from '@/services/analytics'
import { TX_EVENTS, TX_TYPES } from '@/services/analytics/events/transactions'
import { assertWalletChain } from '@/services/tx/tx-sender/sdk'
import madProps from '@/utils/mad-props'
import React, { type ReactElement, type SyntheticEvent, useContext, useState } from 'react'
import { CircularProgress, Box, Button, CardActions, Divider, Alert } from '@mui/material'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { trackError, Errors } from '@/services/exceptions'
import { useCurrentChain } from '@/hooks/useChains'
import CheckWallet from '@/components/common/CheckWallet'
import { useIsExecutionLoop } from '@/components/tx/SignOrExecuteForm/hooks'
import type { SignOrExecuteProps } from '@/components/tx/SignOrExecuteForm'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { asError } from '@/services/exceptions/utils'

import commonCss from '@/components/tx-flow/common/styles.module.css'
import { TxSecurityContext } from '@/components/tx/security/shared/TxSecurityContext'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import NonOwnerError from '@/components/tx/SignOrExecuteForm/NonOwnerError'
import useEstimatedUserOperation from './hooks/useEstimatedUserOperation'
import { useSafe4337Pack } from './hooks/useSafe4337Pack'
import useSafeInfo from '@/hooks/useSafeInfo'
import { use4337Service } from './hooks/use4337Service'

export const CounterfactualForm = ({
  safeTx,
  disableSubmit = false,
  onlyExecute,
  isOwner,
  isExecutionLoop,
  txSecurity,
  onSubmit,
}: SignOrExecuteProps & {
  isOwner: ReturnType<typeof useIsSafeOwner>
  isExecutionLoop: ReturnType<typeof useIsExecutionLoop>
  txSecurity: ReturnType<typeof useTxSecurityContext>
  safeTx?: SafeTransaction
}): ReactElement => {
  const onboard = useOnboard()
  const chain = useCurrentChain()
  const chainId = useChainId()
  const { safe } = useSafeInfo()

  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const { needsRiskConfirmation, isRiskConfirmed, setIsRiskIgnored } = txSecurity
  const { setTxFlow } = useContext(TxModalContext)

  // Estimate gas limit
  const [userOperation, userOperationError] = useEstimatedUserOperation(safeTx)
  const [safe4337Pack] = useSafe4337Pack()
  const safe4337Service = use4337Service()

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    onSubmit?.(Math.random().toString())

    if (needsRiskConfirmation && !isRiskConfirmed) {
      setIsRiskIgnored(true)
      return
    }

    setIsSubmittable(false)
    setSubmitError(undefined)

    try {
      trackEvent({ ...OVERVIEW_EVENTS.PROCEED_WITH_TX, label: TX_TYPES.activate_with_tx })

      onboard && (await assertWalletChain(onboard, chainId))

      if (safe.threshold === 1) {
        // We sign and execute
        await signAndExecuteUserOperation(userOperation, safe4337Pack)
      } else {
        // We sign and propose
        await signAndProposeUserOperation(userOperation, safe4337Pack, safe4337Service)
      }

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

  const cannotPropose = !isOwner && !onlyExecute
  const submitDisabled =
    !userOperation ||
    !safe4337Pack ||
    !isSubmittable ||
    disableSubmit ||
    isExecutionLoop ||
    cannotPropose ||
    (needsRiskConfirmation && !isRiskConfirmed)

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Alert severity="info" sx={{ mb: 2, border: 0 }}>
          Signing and submitting this user operation will activate your account.
          <br />
          <ul style={{ margin: 0, padding: '4px 16px 0' }}>
            <li>
              Estimated User operation fee: &asymp;{' '}
              <strong>
                {getTotalFeeFormatted(
                  BigInt(userOperation?.data.maxFeePerGas ?? '0'),
                  BigInt(userOperation?.data.callGasLimit || '0') +
                    BigInt(userOperation?.data.verificationGasLimit || '0'),
                  chain,
                )}{' '}
                {chain?.nativeCurrency.symbol}
              </strong>
              This fee will be paid from this Safe&apros;s balance
            </li>
          </ul>
        </Alert>

        {/* Error messages */}
        {cannotPropose ? (
          <NonOwnerError />
        ) : isExecutionLoop ? (
          <ErrorMessage>
            Cannot execute a transaction from the Safe Account itself, please connect a different account.
          </ErrorMessage>
        ) : (
          userOperationError && <ErrorMessage error={userOperationError}>Could not create UserOperation</ErrorMessage>
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
