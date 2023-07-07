import { type ReactElement, type SyntheticEvent, useContext, useState } from 'react'
import { Box, Button, CardActions, Divider, SvgIcon } from '@mui/material'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { logError, Errors } from '@/services/exceptions'
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
import PlusIcon from '@/public/images/common/plus.svg'

const SignForm = ({
  safeTx,
  txId,
  onSubmit,
  disableSubmit = false,
  origin,
  isBatch,
}: SignOrExecuteProps & {
  safeTx?: SafeTransaction
}): ReactElement => {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const isOwner = useIsSafeOwner()
  const { signTx, addToBatch } = useTxActions()
  const { setTxFlow } = useContext(TxModalContext)
  const { needsRiskConfirmation, isRiskConfirmed, setIsRiskIgnored } = useContext(TxSecurityContext)
  const hasSigned = useAlreadySigned(safeTx)
  const isCreation = safeTx?.signatures.size === 0

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

    try {
      await (isAddingToBatch ? addToBatch(safeTx, origin) : signTx(safeTx, txId, origin))
    } catch (_err) {
      const err = asError(_err)
      logError(Errors._804, err)
      setIsSubmittable(true)
      setSubmitError(err)
      return
    }

    setTxFlow(undefined)
    onSubmit()
  }

  const onBatchClick = (e: SyntheticEvent) => {
    handleSubmit(e, true)
  }

  const cannotPropose = !isOwner
  const submitDisabled = !safeTx || !isSubmittable || disableSubmit || cannotPropose

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
            <>
              <Button variant="outlined" onClick={onBatchClick} disabled={submitDisabled}>
                <SvgIcon component={PlusIcon} inheritViewBox fontSize="small" sx={{ mr: 1 }} />
                Add to batch
              </Button>

              <Box display="flex" flexDirection="column" justifyContent="center" color="border.main">
                or
              </Box>
            </>
          )}

          {/* Submit button */}
          <CheckWallet>
            {(isOk) => (
              <Button variant="contained" type="submit" disabled={!isOk || submitDisabled}>
                Sign
              </Button>
            )}
          </CheckWallet>
        </Box>
      </CardActions>
    </form>
  )
}

export default SignForm
