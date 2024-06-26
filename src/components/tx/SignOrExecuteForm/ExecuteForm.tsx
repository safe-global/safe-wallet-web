import madProps from '@/utils/mad-props'
import { type ReactElement, type SyntheticEvent, useContext, useState, useMemo } from 'react'
import { CircularProgress, Box, Button, CardActions, Divider } from '@mui/material'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { trackError, Errors } from '@/services/exceptions'
import { useCurrentChain } from '@/hooks/useChains'
import CheckWallet from '@/components/common/CheckWallet'
import { useIsExecutionLoop, useTxActions } from './hooks'
import type { SignOrExecuteProps } from '.'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { TxModalContext } from '@/components/tx-flow'
import { asError } from '@/services/exceptions/utils'
import { isWalletRejection } from '@/utils/wallets'

import commonCss from '@/components/tx-flow/common/styles.module.css'
import { TxSecurityContext } from '../security/shared/TxSecurityContext'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import NonOwnerError from '@/components/tx/SignOrExecuteForm/NonOwnerError'
import WalletRejectionError from '@/components/tx/SignOrExecuteForm/WalletRejectionError'
import { use4337Service } from '@/features/counterfactual/hooks/use4337Service'
import useEstimatedUserOperation from '@/features/counterfactual/hooks/useEstimatedUserOperation'
import { useSafe4337Pack } from '@/features/counterfactual/hooks/useSafe4337Pack'
import { signAndExecuteUserOperation } from '@/features/counterfactual/utils'
import GasParams from '../GasParams'
import { getTotalFeeFormatted } from '@/hooks/useGasPrice'

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
  txActions,
  txSecurity,
}: SignOrExecuteProps & {
  isOwner: ReturnType<typeof useIsSafeOwner>
  isExecutionLoop: ReturnType<typeof useIsExecutionLoop>
  txActions: ReturnType<typeof useTxActions>
  txSecurity: ReturnType<typeof useTxSecurityContext>
  safeTx?: SafeTransaction
}): ReactElement => {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const [isRejectedByUser, setIsRejectedByUser] = useState<Boolean>(false)
  const chain = useCurrentChain()

  // Hooks
  const { executeTx } = txActions
  const { setTxFlow } = useContext(TxModalContext)
  const { needsRiskConfirmation, isRiskConfirmed, setIsRiskIgnored } = txSecurity

  // Estimate gas limit
  const [userOperation, userOperationError, userOperationLoading] = useEstimatedUserOperation(safeTx)
  const [safe4337Pack] = useSafe4337Pack()

  const totalGasLimit = useMemo(
    () => BigInt(userOperation?.data.callGasLimit || '0') + BigInt(userOperation?.data.verificationGasLimit || '0'),
    [userOperation?.data.callGasLimit, userOperation?.data.verificationGasLimit],
  )

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

    try {
      await signAndExecuteUserOperation(userOperation, safe4337Pack)
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
    setTxFlow(undefined)
  }

  const cannotPropose = !isOwner && !onlyExecute
  const submitDisabled =
    !safeTx ||
    !isSubmittable ||
    disableSubmit ||
    isExecutionLoop ||
    cannotPropose ||
    (needsRiskConfirmation && !isRiskConfirmed) ||
    userOperationLoading

  return (
    <>
      <form onSubmit={handleSubmit}>
        <GasParams
          isExecution
          isEIP1559
          params={{
            gasLimit: totalGasLimit,
            maxFeePerGas: userOperation?.data.maxFeePerGas,
            maxPriorityFeePerGas: userOperation?.data.maxPriorityFeePerGas,
            nonce: userOperation?.data.nonce ? Number(userOperation.data.nonce) : undefined,
          }}
        />

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

        {isRejectedByUser && (
          <Box mt={1}>
            <WalletRejectionError />
          </Box>
        )}

        <Divider className={commonCss.nestedDivider} sx={{ pt: 3 }} />

        <CardActions>
          {/* Submit button */}
          <CheckWallet allowNonOwner={onlyExecute}>
            {(isOk) => (
              <Button
                data-testid="execute-form-btn"
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
  txActions: useTxActions,
  txSecurity: useTxSecurityContext,
})
