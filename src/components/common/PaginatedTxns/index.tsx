import { type ReactElement, useEffect, useState } from 'react'
import { Box } from '@mui/material'
import TxList from '@/components/transactions/TxList'
import { type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useTxHistory from '@/hooks/useTxHistory'
import useTxQueue from '@/hooks/useTxQueue'
import PagePlaceholder from '../PagePlaceholder'
import InfiniteScroll from '../InfiniteScroll'
import SkeletonTxList from './SkeletonTxList'
import BatchExecuteButton from '@/components/transactions/BatchExecuteButton'
import TxFilterButton from '@/components/transactions/TxFilterButton'
import { type TxFilter, useTxFilter } from '@/utils/tx-history-filter'
import { BatchExecuteHoverProvider } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import { isTransactionListItem } from '@/utils/transaction-guards'

const NoQueuedTxns = () => (
  <Box mt="5vh">
    <PagePlaceholder imageUrl="/images/no-transactions.svg" text="Queued transactions will appear here" />
  </Box>
)

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

      {page && <TxList items={page.results} />}

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

const PaginatedTxns = ({ useTxns }: { useTxns: typeof useTxHistory | typeof useTxQueue }): ReactElement => {
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
    <BatchExecuteHoverProvider>
      <Box mb={4} position="relative">
        <Box display="flex" flexDirection="column" alignItems="flex-end" mt={[3, '-44px']} mb={[0, '30px']}>
          {isQueue ? <BatchExecuteButton /> : <TxFilterButton />}
        </Box>

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
    </BatchExecuteHoverProvider>
  )
}

export default PaginatedTxns
