import GroupedTxListItems from '@/components/transactions/GroupedTxListItems'
import { useHasPendingTxs } from '@/hooks/usePendingTxs'
import { isLabelListItem } from '@/utils/transaction-guards'
import { groupConflictingTxs } from '@/utils/tx-list'
import { Box } from '@mui/material'
import type { LabelValue, TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import { TransactionListItemType } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement, ReactNode } from 'react'
import { useMemo } from 'react'
import TxListItem from '../TxListItem'
import css from './styles.module.css'

type TxListProps = {
  items: TransactionListPage['results']
}

export const TxListGrid = ({ children }: { children: ReactNode }): ReactElement => {
  return <Box className={css.container}>{children}</Box>
}

const adjustPendingLabel = (items: TransactionListPage['results']) => {
  const result = [...items]

  if (isLabelListItem(result[0])) {
    result[0] = {
      label: 'Pending' as LabelValue,
      type: TransactionListItemType.LABEL,
    }
  }

  return result
}

const TxList = ({ items }: TxListProps): ReactElement => {
  const hasPending = useHasPendingTxs()

  const pendingItems = useMemo(() => (hasPending ? adjustPendingLabel(items) : items), [items, hasPending])
  const groupedItems = useMemo(() => groupConflictingTxs(pendingItems), [pendingItems])

  const transactions = groupedItems.map((item, index) => {
    if (Array.isArray(item)) {
      return <GroupedTxListItems key={index} groupedListItems={item} />
    }

    return <TxListItem key={index} item={item} />
  })

  return <TxListGrid>{transactions}</TxListGrid>
}

export default TxList
