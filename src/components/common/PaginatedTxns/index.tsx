import { type ReactElement, useEffect, useState } from 'react'
import { Box } from '@mui/material'
import TxList from '@/components/transactions/TxList'
import { type TransactionListPage } from '@safe-global/safe-gateway-typescript-sdk'
import ErrorMessage from '@/components/tx/ErrorMessage'
import type useTxHistory from '@/hooks/useTxHistory'
import useTxQueue from '@/hooks/useTxQueue'
import PagePlaceholder from '../PagePlaceholder'
import InfiniteScroll from '../InfiniteScroll'
import SkeletonTxList from './SkeletonTxList'
import { type TxFilter, useTxFilter } from '@/utils/tx-history-filter'
import { isTransactionListItem } from '@/utils/transaction-guards'
import NoTransactionsIcon from '@/public/images/transactions/no-transactions.svg'

const NoQueuedTxns = () => {
  return <PagePlaceholder img={<NoTransactionsIcon />} text="Queued transactions will appear here" />
}

const getFilterResultCount = (filter: TxFilter, page: TransactionListPage) => {
  const count = page.results.filter(isTransactionListItem).length

  return `${page.next ? '> ' : ''}${count} ${filter.type} transactions found`.toLowerCase()
}

const TxPage = ({
  pageUrl,
  useTxns,
  onNextPage,
  isFirstPage,
}: {
  pageUrl: string
  useTxns: typeof useTxHistory | typeof useTxQueue
  onNextPage?: (pageUrl: string) => void
  isFirstPage: boolean
}): ReactElement => {
  const { page, error, loading } = useTxns(pageUrl)
  const [filter] = useTxFilter()
  const isQueue = useTxns === useTxQueue

  return (
    <>
      {isFirstPage && filter && page && (
        <Box display="flex" flexDirection="column" alignItems="flex-end" pt={[2, 0]} pb={3}>
          {getFilterResultCount(filter, page)}
        </Box>
      )}

      {page && page.results.length > 0 && <TxList items={page.results} />}

      {isQueue && page?.results.length === 0 && <NoQueuedTxns />}

      {error && <ErrorMessage>Error loading transactions</ErrorMessage>}

      {loading && <SkeletonTxList />}

      {page?.next && onNextPage && (
        <Box my={4} textAlign="center">
          <InfiniteScroll onLoadMore={() => onNextPage(page.next!)} />
        </Box>
      )}
    </>
  )
}

const PaginatedTxns = ({
  useTxns,
  disableTopActionMargins = false,
}: {
  useTxns: typeof useTxHistory | typeof useTxQueue
  disableTopActionMargins?: boolean
}): ReactElement => {
  const [pages, setPages] = useState<string[]>([''])
  const [filter] = useTxFilter()
  const isQueue = useTxns === useTxQueue

  // Reset the pages when the filter changes
  useEffect(() => {
    setPages([''])
  }, [filter, useTxns])

  // Trigger the next page load
  const onNextPage = (pageUrl: string) => {
    setPages((prev) => prev.concat(pageUrl))
  }

  return (
    <Box mb={4} position="relative">
      {pages.map((pageUrl, index) => (
        <TxPage
          key={pageUrl}
          pageUrl={pageUrl}
          useTxns={useTxns}
          isFirstPage={index === 0}
          onNextPage={index === pages.length - 1 ? onNextPage : undefined}
        />
      ))}
    </Box>
  )
}

export default PaginatedTxns
