import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Tooltip } from '@mui/material'

import { useState, type ReactElement, SyntheticEvent } from 'react'
import { useQueuedTxByNonce } from '@/hooks/useTxQueue'
import { isCustomTxInfo, isMultisigExecutionInfo } from '@/utils/transaction-guards'
import RejectTxModal from '@/components/tx/modals/RejectTxModal'
import useIsPending from '@/hooks/useIsPending'
import IconButton from '@mui/material/IconButton'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import Track from '@/components/common/Track'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'

const RejectTxButton = ({
  txSummary,
  compact = false,
}: {
  txSummary: TransactionSummary
  compact?: boolean
}): ReactElement | null => {
  const [open, setOpen] = useState<boolean>(false)
  const isSafeOwner = useIsSafeOwner()
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined
  const queuedTxsByNonce = useQueuedTxByNonce(txNonce)
  const canCancel = !queuedTxsByNonce?.some(
    (item) => isCustomTxInfo(item.transaction.txInfo) && item.transaction.txInfo.isCancellation,
  )
  const isPending = useIsPending(txSummary.id)

  const isDisabled = isPending || !isSafeOwner

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  if (!canCancel) return null

  return (
    <>
      <Track {...TX_LIST_EVENTS.REJECT}>
        {compact ? (
          <Tooltip title="Reject" arrow placement="top">
            <span>
              <IconButton onClick={onClick} color="error" size="small" disabled={isDisabled}>
                <HighlightOffIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Button onClick={onClick} variant="danger" disabled={isDisabled} size="stretched">
            Reject
          </Button>
        )}
      </Track>

      {open && <RejectTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </>
  )
}

export default RejectTxButton
