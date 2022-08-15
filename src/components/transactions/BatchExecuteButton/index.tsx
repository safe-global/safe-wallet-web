import { useCallback, useContext, useMemo } from 'react'
import { Button } from '@mui/material'
import css from './styles.module.css'
import { BatchExecuteHoverContext } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import { Transaction, TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import { useAppSelector } from '@/store'
import { selectPendingTxs } from '@/store/pendingTxsSlice'

const BATCH_LIMIT = 10

const getBatchableTransactions = (items: Transaction[][], nonce: number) => {
  const batchableTransactions: Transaction[] = []
  let currentNonce = nonce

  items.forEach((txs) => {
    const sorted = txs.slice().sort((a, b) => b.transaction.timestamp - a.transaction.timestamp)
    sorted.forEach((tx) => {
      if (
        batchableTransactions.length < BATCH_LIMIT &&
        isMultisigExecutionInfo(tx.transaction.executionInfo) &&
        tx.transaction.executionInfo.nonce === currentNonce &&
        tx.transaction.executionInfo.confirmationsSubmitted >= tx.transaction.executionInfo.confirmationsRequired
      ) {
        batchableTransactions.push(tx)
        currentNonce = tx.transaction.executionInfo.nonce + 1
      }
    })
  })

  return batchableTransactions
}

const BatchExecuteButton = ({ items }: { items: (TransactionListItem | Transaction[])[] }) => {
  const pendingTxs = useAppSelector(selectPendingTxs)
  const hoverContext = useContext(BatchExecuteHoverContext)
  const { safe } = useSafeInfo()

  const currentNonce = safe.nonce

  const groupedTransactions = useMemo(
    () =>
      items
        .map((item) => {
          if (Array.isArray(item)) return item
          if (isTransactionListItem(item)) return [item]
        })
        .filter((item) => item !== undefined) as Transaction[][],
    [items],
  )

  const batchableTransactions = getBatchableTransactions(groupedTransactions, currentNonce)
  const isBatchable = batchableTransactions.length > 1
  const hasPendingTx = batchableTransactions.some((tx) => pendingTxs[tx.transaction.id])
  const isDisabled = !isBatchable || hasPendingTx

  const handleOnMouseEnter = useCallback(() => {
    hoverContext.setActiveHover(batchableTransactions.map((tx) => tx.transaction.id))
  }, [batchableTransactions, hoverContext])

  const handleOnMouseLeave = useCallback(() => {
    hoverContext.setActiveHover()
  }, [hoverContext])

  return (
    <Button
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      className={css.button}
      variant="contained"
      size="small"
      disabled={isDisabled}
    >
      Execute Batch {isBatchable && ` (${batchableTransactions.length})`}
    </Button>
  )
}

export default BatchExecuteButton
