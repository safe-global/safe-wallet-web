import { useCallback, useContext, useState } from 'react'
import { Button } from '@mui/material'
import css from './styles.module.css'
import { BatchExecuteHoverContext } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import { Transaction, TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import { useAppSelector } from '@/store'
import { selectPendingTxs } from '@/store/pendingTxsSlice'
import CustomTooltip from '@/components/common/CustomTooltip'
import useBatchedTxs from '@/hooks/useBatchedTxs'
import BatchExecuteModal from '@/components/tx/modals/BatchExecuteModal'

const BatchExecuteButton = ({ items }: { items: (TransactionListItem | Transaction[])[] }) => {
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

  return (
    <>
      <CustomTooltip
        placement="top-start"
        arrow
        title={
          isDisabled
            ? 'Batch execution is only available for transactions that have been fully signed and are strictly sequential in Safe nonce.'
            : 'All transactions highlighted in light green will be included in the batch execution.'
        }
      >
        <span className={css.button}>
          <Button
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
            variant="contained"
            size="small"
            disabled={isDisabled}
            onClick={() => setOpen(true)}
          >
            Execute batch {isBatchable && ` (${batchableTransactions.length})`}
          </Button>
        </span>
      </CustomTooltip>
      {open && <BatchExecuteModal onClose={() => setOpen(false)} initialData={[{ txs: batchableTransactions }]} />}
    </>
  )
}

export default BatchExecuteButton
