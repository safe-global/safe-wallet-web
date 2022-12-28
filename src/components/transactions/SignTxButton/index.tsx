import type { SyntheticEvent } from 'react'
import { useState, type ReactElement } from 'react'
import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Button, Tooltip } from '@mui/material'

import { isSignableBy } from '@/utils/transaction-guards'
import useWallet from '@/hooks/wallets/useWallet'
import ConfirmTxModal from '@/components/tx/modals/ConfirmTxModal'
import useIsPending from '@/hooks/useIsPending'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import IconButton from '@mui/material/IconButton'
import CheckIcon from '@mui/icons-material/Check'
import Track from '@/components/common/Track'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'

const SignTxButton = ({
  txSummary,
  compact = false,
}: {
  txSummary: TransactionSummary
  compact?: boolean
}): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const wallet = useWallet()
  const isSignable = isSignableBy(txSummary, wallet?.address || '')
  const isSafeOwner = useIsSafeOwner()
  const isPending = useIsPending(txSummary.id)

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  const isDisabled = !isSignable || !isSafeOwner || isPending

  return (
    <>
      <Track {...TX_LIST_EVENTS.CONFIRM}>
        {compact ? (
          <Tooltip title="Confirm" arrow placement="top">
            <span>
              <IconButton onClick={onClick} color="primary" disabled={isDisabled} size="small">
                <CheckIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Button onClick={onClick} variant="contained" disabled={isDisabled} size="stretched">
            Confirm
          </Button>
        )}
      </Track>

      {open && <ConfirmTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </>
  )
}

export default SignTxButton
