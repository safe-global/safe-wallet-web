import madProps from '@/utils/mad-props'
import { type ReactElement, type SyntheticEvent, useContext, useState } from 'react'
import { CircularProgress, Box, Button, CardActions, Divider } from '@mui/material'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { trackError, Errors } from '@/services/exceptions'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import CheckWallet from '@/components/common/CheckWallet'
import { useAlreadySigned, useTxActions } from './hooks'
import type { SignOrExecuteProps } from '.'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { TxModalContext } from '@/components/tx-flow'
import { asError } from '@/services/exceptions/utils'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import { TxSecurityContext } from '../security/shared/TxSecurityContext'
import NonOwnerError from '@/components/tx/SignOrExecuteForm/NonOwnerError'
import BatchButton from './BatchButton'

export const SignForm = ({
  safeTx,
  txId,
  onSubmit,
  disableSubmit = false,
  origin,
  isBatch,
  isBatchable,
  isCreation,
  isOwner,
  txActions,
  txSecurity,
}: SignOrExecuteProps & {
  isOwner: ReturnType<typeof useIsSafeOwner>
  txActions: ReturnType<typeof useTxActions>
  txSecurity: ReturnType<typeof useTxSecurityContext>
  safeTx?: SafeTransaction
}): ReactElement => {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const { signTx, addToBatch } = txActions
  const { setTxFlow } = useContext(TxModalContext)
  const { needsRiskConfirmation, isRiskConfirmed, setIsRiskIgnored } = txSecurity
  const hasSigned = useAlreadySigned(safeTx)

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent, isAddingToBatch = false) => {
    e.preventDefault()

    if (needsRiskConfirmation && !isRiskConfirmed) {
      setIsRiskIgnored(true)
      return
    }

    if (!safeTx) return

    setIsSubmittable(false)
    setSubmitError(undefined)

    let resultTxId: string
    try {
      resultTxId = await (isAddingToBatch ? addToBatch(safeTx, origin) : signTx(safeTx, txId, origin))
    } catch (_err) {
      const err = asError(_err)
      trackError(Errors._805, err)
      setIsSubmittable(true)
      setSubmitError(err)
      return
    }

    // On successful sign
    if (!isAddingToBatch) {
      onSubmit?.(resultTxId)
    }

    setTxFlow(undefined)
  }

  const onBatchClick = (e: SyntheticEvent) => {
    handleSubmit(e, true)
  }

  const cannotPropose = !isOwner
  const submitDisabled =
    !safeTx || !isSubmittable || disableSubmit || cannotPropose || (needsRiskConfirmation && !isRiskConfirmed)

  return (
    <form onSubmit={handleSubmit}>
      {hasSigned && <ErrorMessage level="warning">You have already signed this transaction.</ErrorMessage>}

      {cannotPropose ? (
        <NonOwnerError />
      ) : (
        submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )
      )}

      <Divider className={commonCss.nestedDivider} sx={{ pt: 3 }} />

      <CardActions>
        <Box display="flex" gap={2}>
          {/* Batch button */}
          {isCreation && !isBatch && (
            <BatchButton
              onClick={onBatchClick}
              disabled={submitDisabled || !isBatchable}
              tooltip={!isBatchable ? `Cannot batch this type of transaction` : undefined}
            />
          )}

          {/* Submit button */}
          <CheckWallet>
            {(isOk) => (
              <Button
                data-testid="sign-btn"
                variant="contained"
                type="submit"
                disabled={!isOk || submitDisabled}
                sx={{ minWidth: '82px' }}
              >
                {!isSubmittable ? <CircularProgress size={20} /> : 'Sign'}
              </Button>
            )}
          </CheckWallet>
        </Box>
      </CardActions>
    </form>
  )
}

const useTxSecurityContext = () => useContext(TxSecurityContext)

export default madProps(SignForm, {
  isOwner: useIsSafeOwner,
  txActions: useTxActions,
  txSecurity: useTxSecurityContext,
})
