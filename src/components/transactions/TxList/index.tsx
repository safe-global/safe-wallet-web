import GroupedTxListItems from '@/components/transactions/GroupedTxListItems'
import { groupConflictingTxs } from '@/utils/tx-list'
import { Box } from '@mui/material'
import type { TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement, ReactNode } from 'react'
import { useMemo } from 'react'
import TxListItem from '../TxListItem'
import css from './styles.module.css'

type TxListProps = {
  items: TransactionListPage['results']
}

export const TxListGrid = ({ children }: { children: ReactNode }): ReactElement => {
  return (
    <Box data-sid="78450" className={css.container}>
      {children}
    </Box>
  )
}

const TxList = ({ items }: TxListProps): ReactElement => {
  const groupedItems = useMemo(() => groupConflictingTxs(items), [items])

  const transactions = groupedItems.map((item, index) => {
    if (Array.isArray(item)) {
      return <GroupedTxListItems key={index} groupedListItems={item} />
    }

    return <TxListItem key={index} item={item} />
  })

  return <TxListGrid>{transactions}</TxListGrid>
}

export default TxList
