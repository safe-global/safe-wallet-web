import { Button, SvgIcon } from '@mui/material'
import { useContext } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

import ErrorIcon from '@/public/images/notifications/error.svg'
import IconButton from '@mui/material/IconButton'
import CheckWallet from '@/components/common/CheckWallet'
import { TxModalContext } from '@/components/tx-flow'
import { CancelRecoveryFlow } from '@/components/tx-flow/flows/CancelRecovery'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { dispatchRecoverySkipExpired } from '@/services/tx/tx-sender'
import useSafeInfo from '@/hooks/useSafeInfo'
import useOnboard from '@/hooks/wallets/useOnboard'
import { logError, Errors } from '@/services/exceptions'
import { RecoveryContext } from '../RecoveryContext'
import { useIsGuardian } from '@/hooks/useIsGuardian'
import { useRecoveryTxState } from '@/hooks/useRecoveryTxState'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'

export function CancelRecoveryButton({
  recovery,
  compact = false,
}: {
  recovery: RecoveryQueueItem
  compact?: boolean
}): ReactElement {
  const isOwner = useIsSafeOwner()
  const isGuardian = useIsGuardian()
  const { isExpired } = useRecoveryTxState(recovery)
  const { setTxFlow } = useContext(TxModalContext)
  const onboard = useOnboard()
  const { safe } = useSafeInfo()
  const { refetch } = useContext(RecoveryContext)

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (isOwner) {
      setTxFlow(<CancelRecoveryFlow recovery={recovery} />)
    } else if (onboard) {
      try {
        dispatchRecoverySkipExpired({
          onboard,
          chainId: safe.chainId,
          delayModifierAddress: recovery.address,
          refetchRecoveryData: refetch,
        })
      } catch (e) {
        logError(Errors._813, e)
      }
    }
  }

  return (
    <CheckWallet allowNonOwner>
      {(isOk) => {
        const isDisabled = isOwner ? !isOk : !isOk && !isExpired

        return compact ? (
          <IconButton onClick={onClick} color="error" size="small" disabled={isDisabled}>
            <SvgIcon component={ErrorIcon} inheritViewBox fontSize="small" />
          </IconButton>
        ) : (
          <Button onClick={onClick} variant="danger" disabled={isDisabled} size="stretched">
            Cancel
          </Button>
        )
      }}
    </CheckWallet>
  )
}
