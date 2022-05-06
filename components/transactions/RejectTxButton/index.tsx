import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Tooltip } from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

import { useState, type ReactElement } from 'react'
import { useQueuedTxByNonce } from '@/services/useTxQueue'
import { isCustomTxInfo, isMultisigExecutionInfo } from '@/components/transactions/utils'
import RejectTxModal from '@/components/tx/RejectTxModal'

const RejectTxButton = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : 0
  const queuedTxsByNonce = useQueuedTxByNonce(txNonce)
  const canCancel = !queuedTxsByNonce?.some(
    (item) => isCustomTxInfo(item.transaction.txInfo) && item.transaction.txInfo.isCancellation,
  )

  const onClick = () => {
    setOpen(true)
  }

  return canCancel ? (
    <div>
      <Tooltip title="Reject" arrow placement="top">
        <span>
          <Button onClick={onClick}>
            <HighlightOffIcon color="error" />
          </Button>
        </span>
      </Tooltip>

      {open && <RejectTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </div>
  ) : (
    <></>
  )
}

export default RejectTxButton
