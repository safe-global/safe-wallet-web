import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Tooltip } from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import IconButton from '@mui/material/IconButton'

import React, { useState, type ReactElement } from 'react'
import { useQueuedTxByNonce } from '@/hooks/useTxQueue'
import { isCustomTxInfo, isMultisigExecutionInfo } from '@/utils/transaction-guards'
import RejectTxModal from '@/components/tx/modals/RejectTxModal'
import useIsPending from '@/hooks/useIsPending'

const RejectTxButton = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement | null => {
  const [open, setOpen] = useState<boolean>(false)
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined
  const queuedTxsByNonce = useQueuedTxByNonce(txNonce)
  const canCancel = !queuedTxsByNonce?.some(
    (item) => isCustomTxInfo(item.transaction.txInfo) && item.transaction.txInfo.isCancellation,
  )
  const isPending = useIsPending({ txId: txSummary.id })

  const isDisabled = isPending

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setOpen(true)
  }

  if (!canCancel) return null

  return (
    <>
      <Tooltip title="Reject" arrow placement="top">
        <span>
          <IconButton onClick={onClick} color="error" size="small" disabled={isDisabled}>
            <HighlightOffIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      {open && <RejectTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </>
  )
}

export default RejectTxButton
