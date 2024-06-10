import { TxModalContext } from '@/components/tx-flow'
import madProps from '@/utils/mad-props'
import React, { type ReactElement, type SyntheticEvent, useContext, useState, useCallback } from 'react'
import { CircularProgress, Box, Button, CardActions, Divider, Alert, Typography, SvgIcon } from '@mui/material'

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
import NonOwnerError from '@/components/tx/SignOrExecuteForm/NonOwnerError'
import { useIsGnosisPayOwner } from '@/features/gnosispay/hooks/useIsGnosisPayOwner'
import { useGnosisPayDelayModifier } from './hooks/useGnosisPayDelayModifier'
import { didRevert } from '@/utils/ethers-utils'
import GnosisPayIcon from '@/public/images/common/gnosis-pay.svg'
import CooldownButton from '@/components/common/CooldownButton'

enum ExecutionState {
  QUEUEING,
  AWAITING_DELAY,
  EXECUTABLE,
}

export const GnosisPayExecutionForm = ({
  safeTx,
  disableSubmit = false,
  isGnosisPayOwner,
  isExecutionLoop,
  txSecurity,
  onSubmit,
}: SignOrExecuteProps & {
  isGnosisPayOwner: ReturnType<typeof useIsGnosisPayOwner>
  isExecutionLoop: ReturnType<typeof useIsExecutionLoop>
  txSecurity: ReturnType<typeof useTxSecurityContext>
  safeTx?: SafeTransaction
}): ReactElement => {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  // Stage in which we are
  const [executionState, setExecutionState] = useState<ExecutionState>(ExecutionState.QUEUEING)
  const [executableAt, setExecutableAt] = useState(0)

  // Hooks
  const currentChain = useCurrentChain()
  const { needsRiskConfirmation, isRiskConfirmed, setIsRiskIgnored } = txSecurity
  const { setTxFlow } = useContext(TxModalContext)

  const [delayModifier] = useGnosisPayDelayModifier()

  const enqueueTx = useCallback(() => {
    if (!delayModifier || !safeTx) {
      return undefined
    }

    return delayModifier.delayModifier.execTransactionFromModule(
      safeTx.data.to,
      safeTx.data.value,
      safeTx.data.data,
      safeTx.data.operation,
    )
  }, [delayModifier, safeTx])

  const delayRemainingSeconds = executableAt === 0 ? undefined : Math.floor((executableAt - Date.now()) / 1000)

  const executeTx = useCallback(() => {
    if (!delayModifier || !safeTx) {
      return undefined
    }

    return delayModifier.delayModifier.executeNextTx(
      safeTx.data.to,
      safeTx.data.value,
      safeTx.data.data,
      safeTx.data.operation,
    )
  }, [delayModifier, safeTx])

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
      // depending on the mode we dispatch something
      switch (executionState) {
        case ExecutionState.QUEUEING:
          const queueResult = await enqueueTx()
          queueResult?.wait().then((receipt) => {
            if (receipt === null) {
              throw new Error('No transaction receipt found')
            } else if (didRevert(receipt)) {
              throw new Error('Transaction reverted by EVM')
            } else {
              // Success, we update some data
              setExecutionState(ExecutionState.AWAITING_DELAY)
              setExecutableAt(Date.now() + 1000 * 60 * 3)
              setTimeout(() => setExecutionState(ExecutionState.EXECUTABLE), 1000 * 60 * 3)
            }
          })
          break
        case ExecutionState.EXECUTABLE:
        case ExecutionState.AWAITING_DELAY:
          const executeResult = await executeTx()
          executeResult?.wait().then((receipt) => {
            if (receipt === null) {
              throw new Error('No transaction receipt found')
            } else if (didRevert(receipt)) {
              throw new Error('Transaction reverted by EVM')
            } else {
              // We close the modal
              setTxFlow(undefined)
            }
          })
          break
        default:
        // Do nothing
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
    !safeTx ||
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
          <Typography pt={4}>
            This is an activated Gnosis Pay Safe. Transaction executions have a delay of 3 minutes and require two
            transactions: <br />
            <ul>
              <li>Announce / Queue a new transaction</li>
              <li>Execute the transaction after waiting for 3 minutes</li>
            </ul>
          </Typography>
        </Alert>

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
            {(isOk) =>
              executionState === ExecutionState.AWAITING_DELAY && delayRemainingSeconds ? (
                <CooldownButton
                  variant="contained"
                  cooldown={delayRemainingSeconds}
                  startDisabled
                  type="submit"
                  sx={{ minWidth: '112px' }}
                >
                  Execute
                </CooldownButton>
              ) : (
                <Button variant="contained" type="submit" disabled={!isOk || submitDisabled} sx={{ minWidth: '112px' }}>
                  {!isSubmittable ? (
                    delayRemainingSeconds ? (
                      <Box display="flex" flexDirection="row" gap={1} alignItems="center">
                        <CircularProgress
                          size={20}
                          variant="determinate"
                          value={delayRemainingSeconds / (1000 * 60 * 3)}
                        />
                        <Typography>in {delayRemainingSeconds}s</Typography>
                      </Box>
                    ) : (
                      <CircularProgress size={20} />
                    )
                  ) : (
                    'Execute'
                  )}
                </Button>
              )
            }
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
})
