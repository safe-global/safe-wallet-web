import { trackEvent } from '@/services/analytics'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { Box, Button, CardActions, CircularProgress, Divider, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import { useContext, useEffect, useState } from 'react'

import CheckWallet from '@/components/common/CheckWallet'
import DecodedTx from '@/components/tx/DecodedTx'
import ErrorMessage from '@/components/tx/ErrorMessage'
import ConfirmationTitle, { ConfirmationTitleTypes } from '@/components/tx/SignOrExecuteForm/ConfirmationTitle'
import TxChecks from '@/components/tx/SignOrExecuteForm/TxChecks'
import WalletRejectionError from '@/components/tx/SignOrExecuteForm/WalletRejectionError'
import { WrongChainWarning } from '@/components/tx/WrongChainWarning'
import { RedefineBalanceChanges } from '@/components/tx/security/redefine/RedefineBalanceChange'
import { useIsValidRecoveryExecTransactionFromModule } from '@/features/recovery/hooks/useIsValidRecoveryExecution'
import useRecovery from '@/features/recovery/hooks/useRecovery'
import { dispatchRecoveryProposal } from '@/features/recovery/services/recovery-sender'
import { selectDelayModifierByRecoverer } from '@/features/recovery/services/selectors'
import { getRecoveryProposalTransactions } from '@/features/recovery/services/transaction'
import useDecodeTx from '@/hooks/useDecodeTx'
import useSafeInfo from '@/hooks/useSafeInfo'
import useOnboard from '@/hooks/wallets/useOnboard'
import useWallet from '@/hooks/wallets/useWallet'
import { Errors, trackError } from '@/services/exceptions'
import { asError } from '@/services/exceptions/utils'
import { createMultiSendCallOnlyTx, createTx } from '@/services/tx/tx-sender'
import { getPeriod } from '@/utils/date'
import { isWalletRejection } from '@/utils/wallets'
import type { RecoverAccountFlowProps } from '.'
import { RecoverAccountFlowFields } from '.'
import { TxModalContext } from '../..'
import { SafeTxContext } from '../../SafeTxProvider'
import { OwnerList } from '../../common/OwnerList'
import TxCard from '../../common/TxCard'

import commonCss from '@/components/tx-flow/common/styles.module.css'

export function RecoverAccountFlowReview({ params }: { params: RecoverAccountFlowProps }): ReactElement | null {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const [isRejectedByUser, setIsRejectedByUser] = useState<Boolean>(false)

  // Hooks
  const { setTxFlow } = useContext(TxModalContext)
  const { safeTx, safeTxError, setSafeTx, setSafeTxError } = useContext(SafeTxContext)
  const [decodedData, decodedDataError, decodedDataLoading] = useDecodeTx(safeTx)
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const onboard = useOnboard()
  const [data] = useRecovery()
  const recovery = data && selectDelayModifierByRecoverer(data, wallet?.address ?? '')
  const [, executionValidationError] = useIsValidRecoveryExecTransactionFromModule(recovery?.address, safeTx)

  // Proposal
  const newThreshold = Number(params[RecoverAccountFlowFields.threshold])
  const newOwners = params[RecoverAccountFlowFields.owners]

  useEffect(() => {
    const transactions = getRecoveryProposalTransactions({
      safe,
      newThreshold,
      newOwners,
    })

    const promise = transactions.length > 1 ? createMultiSendCallOnlyTx(transactions) : createTx(transactions[0])

    promise.then(setSafeTx).catch(setSafeTxError)
  }, [newThreshold, newOwners, safe, setSafeTx, setSafeTxError])

  // On modal submit
  const onSubmit = async () => {
    if (!recovery || !onboard || !safeTx) {
      return
    }

    setIsSubmittable(false)
    setSubmitError(undefined)
    setIsRejectedByUser(false)

    try {
      await dispatchRecoveryProposal({
        onboard,
        safe,
        safeTx,
        delayModifierAddress: recovery.address,
      })
      trackEvent({ ...RECOVERY_EVENTS.SUBMIT_RECOVERY_ATTEMPT })
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

    setTxFlow(undefined)
  }

  const submitDisabled = !safeTx || !isSubmittable || !recovery

  return (
    <>
      <TxCard>
        <Typography mb={1}>
          This transaction will reset the Account setup, changing the owners
          {newThreshold !== safe.threshold ? ' and threshold' : ''}.
        </Typography>

        <OwnerList owners={newOwners} />

        <Divider className={commonCss.nestedDivider} sx={{ mt: 'var(--space-2) !important' }} />

        <Box data-sid="32712" my={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            After recovery, Safe Account transactions will require:
          </Typography>
          <Typography>
            <b>{params.threshold}</b> out of <b>{params[RecoverAccountFlowFields.owners].length} owners.</b>
          </Typography>
        </Box>

        <Divider className={commonCss.nestedDivider} />

        <DecodedTx
          tx={safeTx}
          decodedData={decodedData}
          decodedDataError={decodedDataError}
          decodedDataLoading={decodedDataLoading}
        />

        <RedefineBalanceChanges />
      </TxCard>

      <TxCard>
        <TxChecks executionOwner={safe.owners[0].value} />
      </TxCard>

      <TxCard>
        <>
          <ConfirmationTitle variant={ConfirmationTitleTypes.execute} />

          {safeTxError && (
            <ErrorMessage error={safeTxError}>
              This recovery will most likely fail. To save gas costs, avoid executing the transaction.
            </ErrorMessage>
          )}

          {executionValidationError && (
            <ErrorMessage error={executionValidationError}>
              This transaction will most likely fail. To save gas costs, avoid executing the transaction.
            </ErrorMessage>
          )}

          {submitError && (
            <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
          )}

          <WrongChainWarning />

          {recovery?.delay !== undefined && (
            <ErrorMessage level="info">
              Recovery will be{' '}
              {recovery.delay === 0n ? 'immediately possible' : `possible in ${getPeriod(Number(recovery.delay))}`}{' '}
              after this transaction is executed.
            </ErrorMessage>
          )}

          {isRejectedByUser && <WalletRejectionError />}

          <Divider className={commonCss.nestedDivider} />

          <CardActions sx={{ mt: 'var(--space-1) !important' }}>
            <CheckWallet allowNonOwner>
              {(isOk) => (
                <Button data-sid="44825" variant="contained" disabled={!isOk || submitDisabled} onClick={onSubmit}>
                  {!isSubmittable ? <CircularProgress size={20} /> : 'Execute'}
                </Button>
              )}
            </CheckWallet>
          </CardActions>
        </>
      </TxCard>
    </>
  )
}
