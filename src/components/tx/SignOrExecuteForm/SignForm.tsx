import { type ReactElement, type SyntheticEvent, useContext, useState } from 'react'
import { Button, CardActions, Divider } from '@mui/material'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { logError, Errors } from '@/services/exceptions'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import CheckWallet from '@/components/common/CheckWallet'
import { useTxActions } from './hooks'
import type { SignOrExecuteProps } from '.'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { TxModalContext } from '@/components/tx-flow'
import { asError } from '@/services/exceptions/utils'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import RiskConfirmationError from './RiskConfirmationError'

const SignForm = ({
  safeTx,
  txId,
  onSubmit,
  disableSubmit = false,
  origin,
  risk,
}: SignOrExecuteProps & {
  safeTx?: SafeTransaction
}): ReactElement => {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const [submitRisk, setSubmitRisk] = useState<boolean>(false)

  // Hooks
  const isOwner = useIsSafeOwner()
  const { signTx } = useTxActions()
  const { setTxFlow } = useContext(TxModalContext)

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()

    if (risk) {
      setSubmitRisk(true)
      return
    }

    setSubmitRisk(false)
    setIsSubmittable(false)
    setSubmitError(undefined)

    try {
      await signTx(safeTx, txId, origin)
      setTxFlow(undefined)
    } catch (_err) {
      const err = asError(_err)
      logError(Errors._804, err)
      setIsSubmittable(true)
      setSubmitError(err)
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
      ) : submitRisk ? (
        <RiskConfirmationError />
      ) : (
        submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )
      )}

      <Divider className={commonCss.nestedDivider} sx={{ pt: 3 }} />

      <CardActions>
        {/* Submit button */}
        <CheckWallet>
          {(isOk) => (
            <Button variant="contained" type="submit" disabled={!isOk || submitDisabled}>
              Submit
            </Button>
          )}
        </CheckWallet>
      </CardActions>
    </form>
  )
}

export default SignForm
