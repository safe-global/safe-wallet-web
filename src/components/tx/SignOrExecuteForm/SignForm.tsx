import { type ReactElement, type SyntheticEvent, useState } from 'react'
import { Button, Typography } from '@mui/material'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { logError, Errors } from '@/services/exceptions'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import CheckWallet from '@/components/common/CheckWallet'
import { useTxActions } from './hooks'
import type { SignOrExecuteProps } from '.'

const SignForm = ({
  safeTx,
  txId,
  onSubmit,
  children,
  isRejection = false,
  disableSubmit = false,
  origin,
  ...props
}: SignOrExecuteProps): ReactElement => {
  //
  // Hooks & variables
  //
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const isOwner = useIsSafeOwner()
  const { signTx } = useTxActions()

  // Check that the transaction is executable
  const isCreation = !txId

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    setIsSubmittable(false)
    setSubmitError(undefined)

    try {
      await signTx(safeTx, txId, origin)
    } catch (err) {
      logError(Errors._804, (err as Error).message)
      setIsSubmittable(true)
      setSubmitError(err as Error)
      return
    }

    onSubmit()
  }

  const cannotPropose = !isOwner
  const submitDisabled = !safeTx || !isSubmittable || disableSubmit || cannotPropose

  return (
    <form onSubmit={handleSubmit}>
      {/* Error messages */}
      {isSubmittable && cannotPropose ? (
        <ErrorMessage>
          You are currently not an owner of this Safe Account and won&apos;t be able to submit this transaction.
        </ErrorMessage>
      ) : props.error ? (
        <ErrorMessage error={props.error}>
          This transaction will most likely fail.{' '}
          {isCreation
            ? 'To save gas costs, avoid creating the transaction.'
            : 'To save gas costs, reject this transaction.'}
        </ErrorMessage>
      ) : (
        submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )
      )}

      <Typography variant="body2" color="border.main" textAlign="center" mt={3}>
        You&apos;re about to {isCreation ? 'create and ' : ''}
        sign a transaction and will need to confirm it with your currently connected wallet.
      </Typography>

      {/* Submit button */}
      <CheckWallet>
        {(isOk) => (
          <Button variant="contained" type="submit" disabled={!isOk || submitDisabled}>
            Submit
          </Button>
        )}
      </CheckWallet>
    </form>
  )
}

export default SignForm
