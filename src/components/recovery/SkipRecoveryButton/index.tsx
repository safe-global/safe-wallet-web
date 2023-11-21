import { Button, SvgIcon } from '@mui/material'
import { useContext } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

import ErrorIcon from '@/public/images/notifications/error.svg'
import IconButton from '@mui/material/IconButton'
import CheckWallet from '@/components/common/CheckWallet'
import { TxModalContext } from '@/components/tx-flow'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

export function SkipRecoveryButton({
  recovery,
  compact = false,
}: {
  recovery: RecoveryQueueItem
  compact?: boolean
}): ReactElement {
  const { setTxFlow } = useContext(TxModalContext)

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // TODO: Implement skip recovery flow
    setTxFlow(undefined)
  }

  return (
    <CheckWallet>
      {(isOk) =>
        compact ? (
          <IconButton onClick={onClick} color="error" size="small" disabled={!isOk}>
            <SvgIcon component={ErrorIcon} inheritViewBox fontSize="small" />
          </IconButton>
        ) : (
          <Button onClick={onClick} variant="danger" disabled={!isOk} size="stretched">
            Skip
          </Button>
        )
      }
    </CheckWallet>
  )
}
