import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Tooltip } from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import IconButton from '@mui/material/IconButton'

import { useState, type ReactElement } from 'react'
import { useQueuedTxByNonce } from '@/services/useTxQueue'
import { isCustomTxInfo, isMultisigExecutionInfo } from '@/components/transactions/utils'
import RejectTxModal from '@/components/tx/modals/RejectTxModal'

const RejectTxButton = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement | null => {
  const [open, setOpen] = useState<boolean>(false)
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined
  const queuedTxsByNonce = useQueuedTxByNonce(txNonce)
  const canCancel = !queuedTxsByNonce?.some(
    (item) => isCustomTxInfo(item.transaction.txInfo) && item.transaction.txInfo.isCancellation,
  )

  const onClick = () => {
    setOpen(true)
  }

  if (!canCancel) return null

  return (
    <div>
      <Tooltip title="Reject" arrow placement="top">
        <span>
          <IconButton onClick={onClick} color="error">
            <HighlightOffIcon />
          </IconButton>
        </span>
      </Tooltip>

      {open && <RejectTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </div>
  )
}

export default RejectTxButton
