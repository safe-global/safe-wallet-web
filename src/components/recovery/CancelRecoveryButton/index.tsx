import { Button, SvgIcon } from '@mui/material'
import { useContext } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

import ErrorIcon from '@/public/images/notifications/error.svg'
import IconButton from '@mui/material/IconButton'
import CheckWallet from '@/components/common/CheckWallet'
import { TxModalContext } from '@/components/tx-flow'
import { CancelRecoveryFlow } from '@/components/tx-flow/flows/CancelRecovery'
import type { RecoveryQueueItem } from '@/components/recovery/RecoveryLoaderContext'

export function CancelRecoveryButton({
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

    setTxFlow(<CancelRecoveryFlow recovery={recovery} />)
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
            Cancel
          </Button>
        )
      }
    </CheckWallet>
  )
}
