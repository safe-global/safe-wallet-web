import { useCallback, useContext, useState } from 'react'
import { Button, Tooltip } from '@mui/material'
import { BatchExecuteHoverContext } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import type { GroupedTxs } from '@/hooks/useGroupedTxs'
import { useAppSelector } from '@/store'
import { selectPendingTxs } from '@/store/pendingTxsSlice'
import useBatchedTxs from '@/hooks/useBatchedTxs'
import BatchExecuteModal from '@/components/tx/modals/BatchExecuteModal'
import { trackEvent } from '@/services/analytics'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'

const BatchExecuteButton = ({ items, className }: { items: GroupedTxs; className: string }) => {
  const [open, setOpen] = useState(false)
  const pendingTxs = useAppSelector(selectPendingTxs)
  const hoverContext = useContext(BatchExecuteHoverContext)
  const batchableTransactions = useBatchedTxs(items)

  const isBatchable = batchableTransactions.length > 1
  const hasPendingTx = batchableTransactions.some((tx) => pendingTxs[tx.transaction.id])
  const isDisabled = !isBatchable || hasPendingTx

  const handleOnMouseEnter = useCallback(() => {
    hoverContext.setActiveHover(batchableTransactions.map((tx) => tx.transaction.id))
  }, [batchableTransactions, hoverContext])

  const handleOnMouseLeave = useCallback(() => {
    hoverContext.setActiveHover([])
  }, [hoverContext])

  const handleOpenModal = () => {
    trackEvent({
      ...TX_LIST_EVENTS.BATCH_EXECUTE,
      label: batchableTransactions.length,
    })

    setOpen(true)
  }

  return (
    <>
      <Tooltip
        placement="top-start"
        arrow
        title={
          isDisabled
            ? 'Batch execution is only available for transactions that have been fully signed and are strictly sequential in Safe nonce.'
            : 'All transactions highlighted in light green will be included in the batch execution.'
        }
      >
        <span className={className}>
          <Button
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
            variant="contained"
            size="small"
            disabled={isDisabled}
            onClick={handleOpenModal}
          >
            Execute batch{isBatchable && ` (${batchableTransactions.length})`}
          </Button>
        </span>
      </Tooltip>
      {open && <BatchExecuteModal onClose={() => setOpen(false)} initialData={[{ txs: batchableTransactions }]} />}
    </>
  )
}

export default BatchExecuteButton
