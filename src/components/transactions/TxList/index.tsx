import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { Box } from '@mui/material'
import type { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import TxListItem from '../TxListItem'
import GroupedTxListItems from '@/components/transactions/GroupedTxListItems'
import { groupConflictingTxs } from '@/utils/tx-list'

type TxListProps = {
  items: TransactionListPage['results']
}

export const TxListGrid = ({ children }: { children: ReactElement | ReactElement[] }): ReactElement => {
  return (
    <Box display="flex" flexDirection="column" gap="6px">
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
