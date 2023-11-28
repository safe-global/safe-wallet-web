import { Button, SvgIcon } from '@mui/material'
import { useContext } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

import ErrorIcon from '@/public/images/notifications/error.svg'
import IconButton from '@mui/material/IconButton'
import CheckWallet from '@/components/common/CheckWallet'
import { TxModalContext } from '@/components/tx-flow'
import { CancelRecoveryFlow } from '@/components/tx-flow/flows/CancelRecovery'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { dispatchRecoverySkipExpired } from '@/services/recovery/recovery-sender'
import useSafeInfo from '@/hooks/useSafeInfo'
import useOnboard from '@/hooks/wallets/useOnboard'
import { trackError, Errors } from '@/services/exceptions'
import { asError } from '@/services/exceptions/utils'
import { useIsGuardian } from '@/hooks/useIsGuardian'
import { useRecoveryTxState } from '@/hooks/useRecoveryTxState'
import { RecoveryListItemContext } from '../RecoveryListItem/RecoveryListItemContext'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'

export function CancelRecoveryButton({
  recovery,
  compact = false,
}: {
  recovery: RecoveryQueueItem
  compact?: boolean
}): ReactElement {
  const { setSubmitError } = useContext(RecoveryListItemContext)
  const isOwner = useIsSafeOwner()
  const isGuardian = useIsGuardian()
  const { isExpired, isPending } = useRecoveryTxState(recovery)
  const { setTxFlow } = useContext(TxModalContext)
  const onboard = useOnboard()
  const { safe } = useSafeInfo()

  const onClick = async (e: SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (isOwner) {
      setTxFlow(<CancelRecoveryFlow recovery={recovery} />)
    } else if (onboard) {
      try {
        await dispatchRecoverySkipExpired({
          onboard,
          chainId: safe.chainId,
          delayModifierAddress: recovery.address,
          recoveryTxHash: recovery.args.txHash,
        })
      } catch (_err) {
        const err = asError(_err)

        trackError(Errors._813, err)
        setSubmitError(err)
      }
    }
  }

  return (
    <CheckWallet allowNonOwner>
      {(isOk) => {
        const isDisabled = !isOk || isPending || (isGuardian && !isExpired)

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
