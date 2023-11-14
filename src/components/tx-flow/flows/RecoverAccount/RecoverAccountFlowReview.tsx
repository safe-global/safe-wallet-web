import { CardActions, Button, Typography, Divider, Box } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import type { ReactElement } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import { getRecoveryProposalTransactions } from '@/services/recovery/transaction'
import DecodedTx from '@/components/tx/DecodedTx'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { RedefineBalanceChanges } from '@/components/tx/security/redefine/RedefineBalanceChange'
import ConfirmationTitle, { ConfirmationTitleTypes } from '@/components/tx/SignOrExecuteForm/ConfirmationTitle'
import TxChecks from '@/components/tx/SignOrExecuteForm/TxChecks'
import { WrongChainWarning } from '@/components/tx/WrongChainWarning'
import useDecodeTx from '@/hooks/useDecodeTx'
import TxCard from '../../common/TxCard'
import { SafeTxContext } from '../../SafeTxProvider'
import CheckWallet from '@/components/common/CheckWallet'
import { createMultiSendCallOnlyTx, createTx, dispatchRecoveryProposal } from '@/services/tx/tx-sender'
import { RecoverAccountFlowFields } from '.'
import { NewOwnerList } from '../../common/NewOwnerList'
import { useAppSelector } from '@/store'
import { selectRecoveryByGuardian } from '@/store/recoverySlice'
import useWallet from '@/hooks/wallets/useWallet'
import useOnboard from '@/hooks/wallets/useOnboard'
import { TxModalContext } from '../..'
import { asError } from '@/services/exceptions/utils'
import { trackError, Errors } from '@/services/exceptions'
import type { RecoverAccountFlowProps } from '.'

import commonCss from '@/components/tx-flow/common/styles.module.css'

export function RecoverAccountFlowReview({ params }: { params: RecoverAccountFlowProps }): ReactElement | null {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const { setTxFlow } = useContext(TxModalContext)
  const { safeTx, safeTxError, setSafeTx, setSafeTxError } = useContext(SafeTxContext)
  const [decodedData, decodedDataError, decodedDataLoading] = useDecodeTx(safeTx)
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const onboard = useOnboard()
  const recovery = useAppSelector((state) => selectRecoveryByGuardian(state, wallet?.address ?? ''))

  // Proposal
  const txCooldown = recovery?.txCooldown?.toNumber()
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
    if (!recovery || !onboard) {
      return
    }

    setIsSubmittable(false)
    setSubmitError(undefined)

    try {
      await dispatchRecoveryProposal({ onboard, safe, newThreshold, newOwners, delayModifierAddress: recovery.address })
    } catch (_err) {
      const err = asError(_err)
      trackError(Errors._810, err)
      setIsSubmittable(true)
      setSubmitError(err)
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

        <NewOwnerList newOwners={newOwners} />

        <Divider className={commonCss.nestedDivider} sx={{ mt: 'var(--space-2) !important' }} />

        <Box my={1}>
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
        <TxChecks isRecovery />
      </TxCard>

      <TxCard>
        <ConfirmationTitle variant={ConfirmationTitleTypes.execute} />

        {safeTxError && (
          <ErrorMessage error={safeTxError}>
            This recovery will most likely fail. To save gas costs, avoid executing the transaction.
          </ErrorMessage>
        )}

        {submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )}

        <WrongChainWarning />

        <ErrorMessage level="info">
          {/* // TODO: Convert txCooldown to days, minutes, seconds when https://github.com/safe-global/safe-wallet-web/pull/2772 is merged */}
          Recovery will be {txCooldown === 0 ? 'immediately possible' : `possible ${txCooldown}`} after this transaction
          is executed.
        </ErrorMessage>

        <Divider className={commonCss.nestedDivider} />

        <CardActions sx={{ mt: 'var(--space-1) !important' }}>
          <CheckWallet allowNonOwner>
            {(isOk) => (
              <Button variant="contained" disabled={!isOk || submitDisabled} onClick={onSubmit}>
                Execute
              </Button>
            )}
          </CheckWallet>
        </CardActions>
      </TxCard>
    </>
  )
}
