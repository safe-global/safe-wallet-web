import GroupedTxListItems from '@/components/transactions/GroupedTxListItems'
import { groupBulkTxs, groupConflictingTxs } from '@/utils/tx-list'
import { Box } from '@mui/material'
import type { TransactionDetails, TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement, ReactNode } from 'react'
import { useMemo } from 'react'
import TxListItem from '../TxListItem'
import css from './styles.module.css'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { isTransactionListItem } from '@/utils/transaction-guards'
import { getTxDetailsWithBackoff } from '@/utils/transactions'

type TxListProps = {
  items: TransactionListPage['results']
}

export const TxListGrid = ({ children }: { children: ReactNode }): ReactElement => {
  return <Box className={css.container}>{children}</Box>
}

const TxList = ({ items }: TxListProps): ReactElement => {
  const chainId = useChainId()

  const [txHashes] = useAsync(async () => {
    const transactions = items.filter(isTransactionListItem)
    return await getTxDetailsWithBackoff(transactions, chainId).then((txDetailsList) => {
      return txDetailsList.reduce((accumulator: Record<string, string>, txDetails: TransactionDetails) => {
        const { txId, txHash } = txDetails
        if (!txId || !txHash) return accumulator
        accumulator[txId] = txHash
        return accumulator
      }, {})
    })
  }, [chainId, items])

  const groupedByConflicts = useMemo(() => groupConflictingTxs(items), [items])
  const groupedByBulks = useMemo(() => groupBulkTxs(groupedByConflicts, txHashes), [groupedByConflicts, txHashes])

  const transactions = groupedByBulks.map((item, index) => {
    if (Array.isArray(item)) {
      return <GroupedTxListItems key={index} groupedListItems={item} />
    }

    return <TxListItem key={index} item={item} />
  })

  return <TxListGrid>{transactions}</TxListGrid>
}

export default TxList
