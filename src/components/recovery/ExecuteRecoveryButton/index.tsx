import { Button, SvgIcon, Tooltip } from '@mui/material'
import { useContext } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

import RocketIcon from '@/public/images/transactions/rocket.svg'
import IconButton from '@mui/material/IconButton'
import CheckWallet from '@/components/common/CheckWallet'
import { dispatchRecoveryExecution } from '@/services/tx/tx-sender'
import useOnboard from '@/hooks/wallets/useOnboard'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useRecoveryTxState } from '@/hooks/useRecoveryTxState'
import { Errors, logError } from '@/services/exceptions'
import type { RecoveryQueueItem } from '@/store/recoverySlice'
import { RecoveryLoaderContext } from '../RecoveryLoaderContext'

export function ExecuteRecoveryButton({
  recovery,
  compact = false,
}: {
  recovery: RecoveryQueueItem
  compact?: boolean
}): ReactElement {
  const { isExecutable } = useRecoveryTxState(recovery)
  const onboard = useOnboard()
  const { safe } = useSafeInfo()
  const { refetch } = useContext(RecoveryLoaderContext)

  const onClick = async (e: SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!onboard) {
      return
    }

    try {
      await dispatchRecoveryExecution({
        onboard,
        chainId: safe.chainId,
        args: recovery.args,
        delayModifierAddress: recovery.address,
        refetchRecoveryData: refetch,
      })
    } catch (e) {
      logError(Errors._812, e)
    }
  }

  return (
    <CheckWallet allowNonOwner>
      {(isOk) => {
        const isDisabled = !isOk || !isExecutable

        return (
          <Tooltip title={isDisabled ? 'Previous recovery attempts must be executed or skipped first' : null}>
            <span>
              {compact ? (
                <IconButton onClick={onClick} color="primary" disabled={isDisabled} size="small">
                  <SvgIcon component={RocketIcon} inheritViewBox fontSize="small" />
                </IconButton>
              ) : (
                <Button onClick={onClick} variant="contained" disabled={isDisabled} size="stretched">
                  Execute
                </Button>
              )}
            </span>
          </Tooltip>
        )
      }}
    </CheckWallet>
  )
}
