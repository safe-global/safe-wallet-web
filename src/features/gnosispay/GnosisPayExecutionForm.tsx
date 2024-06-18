import { TxModalContext } from '@/components/tx-flow'
import madProps from '@/utils/mad-props'
import React, { type ReactElement, type SyntheticEvent, useContext, useState, useMemo } from 'react'
import {
  CircularProgress,
  Box,
  Button,
  CardActions,
  Divider,
  Alert,
  Typography,
  SvgIcon,
  AlertTitle,
} from '@mui/material'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { trackError, Errors } from '@/services/exceptions'
import CheckWallet from '@/components/common/CheckWallet'
import { useIsExecutionLoop } from '@/components/tx/SignOrExecuteForm/hooks'
import type { SignOrExecuteProps } from '@/components/tx/SignOrExecuteForm'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { asError } from '@/services/exceptions/utils'

import commonCss from '@/components/tx-flow/common/styles.module.css'
import { TxSecurityContext } from '@/components/tx/security/shared/TxSecurityContext'
import NonOwnerError from '@/components/tx/SignOrExecuteForm/NonOwnerError'
import { useIsGnosisPayOwner } from '@/features/gnosispay/hooks/useIsGnosisPayOwner'
import { useGnosisPayDelayModifier } from './hooks/useGnosisPayDelayModifier'
import { didRevert } from '@/utils/ethers-utils'
import GnosisPayIcon from '@/public/images/common/gnosis-pay.svg'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getGnosisPayTxWarnings } from './utils/getGnosisPayTxWarnings'
import useAsync from '@/hooks/useAsync'
import { useAppDispatch } from '@/store'
import { type GnosisPayTxItem, enqueueTransaction, removeFirst } from '@/store/gnosisPayTxsSlice'
import { useGnosisPayActions } from './hooks/useGnosisPayActions'

export const GnosisPayExecutionForm = ({
  safeTx,
  disableSubmit = false,
  isGnosisPayOwner,
  isExecutionLoop,
  txSecurity,
  onSubmit,
  safeInfo,
  queuedGnosisPayTx,
}: SignOrExecuteProps & {
  isGnosisPayOwner: ReturnType<typeof useIsGnosisPayOwner>
  isExecutionLoop: ReturnType<typeof useIsExecutionLoop>
  txSecurity: ReturnType<typeof useTxSecurityContext>
  safeTx?: SafeTransaction
  safeInfo: ReturnType<typeof useSafeInfo>
  queuedGnosisPayTx?: GnosisPayTxItem
}): ReactElement => {
  const dispatch = useAppDispatch()
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Hooks
  const { needsRiskConfirmation, isRiskConfirmed, setIsRiskIgnored } = txSecurity
  const { setTxFlow } = useContext(TxModalContext)
  const [delayModifier] = useGnosisPayDelayModifier()

  const { enqueueTx, executeTx } = useGnosisPayActions(
    delayModifier?.delayModifier,
    safeTx?.data ?? queuedGnosisPayTx?.safeTxData,
  )

  const [delayModifierNonces] = useAsync(async () => {
    if (!delayModifier?.delayModifier) {
      return
    }
    const queueNonce = await delayModifier.delayModifier.queueNonce()
    const txNonce = await delayModifier.delayModifier.txNonce()
    return { queueNonce, txNonce }
  }, [delayModifier])

  const txWarnings = useMemo(() => getGnosisPayTxWarnings(safeTx, safeInfo.safe), [safeInfo.safe, safeTx])

  const isNotNextInQueue =
    delayModifierNonces && queuedGnosisPayTx && queuedGnosisPayTx.queueNonce > delayModifierNonces.txNonce

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()

    if (!delayModifierNonces || (!safeTx && !queuedGnosisPayTx)) {
      return
    }

    onSubmit?.(Math.random().toString())

    if (needsRiskConfirmation && !isRiskConfirmed) {
      setIsRiskIgnored(true)
      return
    }

    setIsSubmittable(false)
    setSubmitError(undefined)

    try {
      // depending on the mode we dispatch something
      if (!queuedGnosisPayTx && safeTx) {
        const queueResult = await enqueueTx()
        queueResult?.wait().then((receipt) => {
          if (receipt === null) {
            throw new Error('No transaction receipt found')
          } else if (didRevert(receipt)) {
            throw new Error('Transaction reverted by EVM')
          } else {
            // Success, we update some data
            dispatch(
              enqueueTransaction({
                executableAt: Date.now() + 1000 * 60 * 3,
                expiresAt: Date.now() + 1000 * 60 * 30,
                queueNonce: Number(delayModifierNonces.queueNonce),
                safeAddress: safeInfo.safeAddress,
                safeTxData: safeTx.data,
              }),
            )
            // We close the modal
            setTxFlow(undefined)
          }
        })
      } else if (queuedGnosisPayTx) {
        const executeResult = await executeTx()
        executeResult?.wait().then((receipt) => {
          if (receipt === null) {
            throw new Error('No transaction receipt found')
          } else if (didRevert(receipt)) {
            throw new Error('Transaction reverted by EVM')
          } else {
            // We remove it from the queue and close the modal
            dispatch(removeFirst({ safeAddress: safeInfo.safeAddress }))
            setTxFlow(undefined)
          }
        })
      }
    } catch (_err) {
      const err = asError(_err)
      trackError(Errors._804, err)
      setIsSubmittable(true)
      setSubmitError(err)
      return
    }
  }

  const cannotPropose = !isGnosisPayOwner
  const submitDisabled =
    (!safeTx && !queuedGnosisPayTx) ||
    !isSubmittable ||
    disableSubmit ||
    isExecutionLoop ||
    cannotPropose ||
    (needsRiskConfirmation && !isRiskConfirmed)

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Alert severity="info" sx={{ mb: 2, border: 0, position: 'relative' }} icon={false}>
          <SvgIcon
            component={GnosisPayIcon}
            inheritViewBox
            fontSize="large"
            sx={{ position: 'absolute', top: '16px', left: '16px', width: '225px', height: '25px' }}
          />
          {queuedGnosisPayTx ? (
            <Typography pt={4}>
              This is an activated Gnosis Pay Safe. You are about to execute the next transaction is the Delay queue of
              the Safe.
            </Typography>
          ) : (
            <Typography pt={4}>
              This is an activated Gnosis Pay Safe. Transaction executions have a delay of 3 minutes and require two
              transactions: <br />
              <ul>
                <li>Announce / Queue a new transaction</li>
                <li>Execute the transaction after waiting for 3 minutes</li>
              </ul>
            </Typography>
          )}
        </Alert>

        {txWarnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2, border: 0, position: 'relative' }}>
            <AlertTitle>
              <b>Potential problems</b>
            </AlertTitle>
            <ul>
              {txWarnings.map((txWarning, idx) => (
                <li key={idx}>{txWarning}</li>
              ))}
            </ul>
          </Alert>
        )}

        {isNotNextInQueue && (
          <Alert severity="warning" sx={{ mb: 2, border: 0, position: 'relative' }} icon={false}>
            <AlertTitle>
              <b>Unknown queued transaction</b>
            </AlertTitle>
            There are one or more transactions in front of this one in the Delay queue. You have to skip or execute that
            one first.
          </Alert>
        )}

        {/* Error messages */}
        {cannotPropose ? (
          <NonOwnerError />
        ) : (
          isExecutionLoop && (
            <ErrorMessage>
              Cannot execute a transaction from the Safe Account itself, please connect a different account.
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
          <CheckWallet allowGnosisPayOwner>
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

export default madProps(GnosisPayExecutionForm, {
  isGnosisPayOwner: useIsGnosisPayOwner,
  isExecutionLoop: useIsExecutionLoop,
  txSecurity: useTxSecurityContext,
  safeInfo: useSafeInfo,
})
