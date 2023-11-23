import { Button, SvgIcon } from '@mui/material'
import { useContext } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

import ErrorIcon from '@/public/images/notifications/error.svg'
import IconButton from '@mui/material/IconButton'
import CheckWallet from '@/components/common/CheckWallet'
import { TxModalContext } from '@/components/tx-flow'
import { SkipRecoveryFlow } from '@/components/tx-flow/flows/SkipRecovery'
import type { RecoveryQueueItem } from '@/components/recovery/RecoveryLoaderContext'

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

    setTxFlow(<SkipRecoveryFlow recovery={recovery} />)
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
