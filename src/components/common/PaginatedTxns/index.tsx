import { type ReactElement, useEffect, useState, useMemo, useCallback } from 'react'
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

const PaginatedTxns = ({ useTxns }: { useTxns: typeof useTxHistory | typeof useTxQueue }): ReactElement => {
  const [pages, setPages] = useState<TransactionListPage[]>([])
  const [pageUrl, setPageUrl] = useState<string>()
  const [pageIndex, setPageIndex] = useState<number>(0)
  const [filter] = useTxFilter()
  const isQueue = useTxns === useTxQueue
  const allItems = useMemo(() => pages.flatMap((page) => page.results), [pages])

  // Reset the pages when the filter changes
  useEffect(() => {
    setPages([])
    setPageUrl(undefined)
    setPageIndex(0)
  }, [filter, useTxns])

  // Load the current page
  const { page: currentPage, error, loading } = useTxns(pageUrl)

  // When a tx page is loaded, update the list of pages
  useEffect(() => {
    if (!currentPage) return

    setPages((prevPages) => {
      const newPages = prevPages.slice()
      // Update the page at the current index
      // If we're on the first page, it will be refreshed on every poll
      newPages[pageIndex] = currentPage
      return newPages
    })
  }, [currentPage, pageIndex])

  // Trigger the next page load
  const onNextPage = useCallback(() => {
    if (currentPage?.next) {
      setPageUrl(currentPage.next)
      setPageIndex((index) => index + 1)
    }
  }, [currentPage])

  return (
    <Box mb={4} position="relative">
      <Box display="flex" flexDirection="column" alignItems="flex-end" mt={[3, '-44px']} mb={[0, '30px']}>
        {isQueue ? <BatchExecuteButton items={allItems} /> : <TxFilterButton />}
      </Box>

      {filter && currentPage && (
        <Box display="flex" flexDirection="column" alignItems="flex-end" pt={[2, 0]} pb={3}>
          {getFilterResultCount(filter, currentPage)}
        </Box>
      )}

      <BatchExecuteHoverProvider>
        {allItems.length ? <TxList items={allItems} /> : isQueue && !loading && <NoQueuedTxns />}
      </BatchExecuteHoverProvider>

      {error && <ErrorMessage>Error loading transactions</ErrorMessage>}

      {loading && <SkeletonTxList />}

      {currentPage?.next && currentPage?.next !== pageUrl && (
        <Box my={4} textAlign="center">
          <InfiniteScroll onLoadMore={onNextPage} />
        </Box>
      )}
    </Box>
  )
}

export default PaginatedTxns
