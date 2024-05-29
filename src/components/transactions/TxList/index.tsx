import GroupedTxListItems from '@/components/transactions/GroupedTxListItems'
import BulkTxListGroup from '@/components/transactions//BulkTxListGroup'
import { groupTxs } from '@/utils/tx-list'
import { Box } from '@mui/material'
import type { Transaction, TransactionDetails, TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement, ReactNode } from 'react'
import { useMemo } from 'react'
import TxListItem from '../TxListItem'
import css from './styles.module.css'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { isTransactionListItem } from '@/utils/transaction-guards'
import { getTxDetailsWithBackoff } from '@/utils/transactions'
import { uniq } from 'lodash'

type TxListProps = {
  items: TransactionListPage['results']
}

const getBulkGroupTxHash = (group: Transaction[], txHashes: Record<string, string>) => {
  const hashList = group.map((item) => {
    const txId = item.transaction.id
    return txHashes[txId]
  })
  return uniq(hashList).length === 1 ? hashList[0] : undefined
}

export const TxListGrid = ({ children }: { children: ReactNode }): ReactElement => {
  return <Box className={css.container}>{children}</Box>
}

const TxList = ({ items }: TxListProps): ReactElement => {
  const chainId = useChainId()

  const [txHashesById] = useAsync(async () => {
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

  const groupedTransactions = useMemo(() => groupTxs(items, txHashesById), [items, txHashesById])

  const transactions = groupedTransactions.map((item, index) => {
    if (!Array.isArray(item)) {
      return <TxListItem key={index} item={item} />
    }

    const bulkTransactionHash = txHashesById && getBulkGroupTxHash(item, txHashesById)
    if (bulkTransactionHash) {
      return <BulkTxListGroup key={index} groupedListItems={item} transactionHash={bulkTransactionHash} />
    }

    return <GroupedTxListItems key={index} groupedListItems={item} />
  })

  return <TxListGrid>{transactions}</TxListGrid>
}

export default TxList
