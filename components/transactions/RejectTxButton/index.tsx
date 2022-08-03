import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Tooltip } from '@mui/material'

import { useState, type ReactElement, SyntheticEvent } from 'react'
import { useQueuedTxByNonce } from '@/hooks/useTxQueue'
import { isCustomTxInfo, isMultisigExecutionInfo } from '@/utils/transaction-guards'
import RejectTxModal from '@/components/tx/modals/RejectTxModal'
import useIsPending from '@/hooks/useIsPending'

const RejectTxButton = ({
  txSummary,
  children,
}: {
  txSummary: TransactionSummary
  children: (onClick: (e: SyntheticEvent) => void, isDisabled: boolean) => ReactElement
}): ReactElement | null => {
  const [open, setOpen] = useState<boolean>(false)
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined
  const queuedTxsByNonce = useQueuedTxByNonce(txNonce)
  const canCancel = !queuedTxsByNonce?.some(
    (item) => isCustomTxInfo(item.transaction.txInfo) && item.transaction.txInfo.isCancellation,
  )
  const isPending = useIsPending({ txId: txSummary.id })

  const isDisabled = isPending

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  if (!canCancel) return null

  return (
    <>
      <Tooltip title="Reject" arrow placement="top">
        {children(onClick, isDisabled)}
      </Tooltip>

      {open && <RejectTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </>
  )
}

export default RejectTxButton
