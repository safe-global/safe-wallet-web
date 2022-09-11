import { type ReactElement, useEffect, useState, useMemo } from 'react'
import { Box } from '@mui/material'
import flatten from 'lodash/flatten'
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
import { useTxFilter } from '@/utils/tx-history-filter'
import { BatchExecuteHoverProvider } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'

const NoQueuedTxns = () => (
  <Box mt="5vh">
    <PagePlaceholder imageUrl="/images/no-transactions.svg" text="Queued transactions will appear here" />
  </Box>
)

const PaginatedTxns = ({ useTxns }: { useTxns: typeof useTxHistory | typeof useTxQueue }): ReactElement => {
  const [pages, setPages] = useState<TransactionListPage[]>([])
  const [pageUrl, setPageUrl] = useState<string>()
  const [filter] = useTxFilter()
  const isQueue = useTxns === useTxQueue
  const allItems = useMemo(() => flatten(pages.map((page) => page.results)), [pages])

  // Load the current page
  const { page: lastPage, error, loading } = useTxns(pageUrl)

  // When the next page is loaded, update the list of pages
  useEffect(() => {
    if (!lastPage) return

    // If no pageUrl (i.e. we're on the first page), "refresh" that page because it's polled.
    // Otherwise, append the new page to the list of pages.
    setPages((prevPages) => (pageUrl ? prevPages.concat(lastPage) : [lastPage]))
  }, [lastPage, pageUrl])

  // Reset the pages when the filter changes
  useEffect(() => {
    setPages([])
  }, [filter])

  return (
    <Box mb={4} position="relative">
      <Box display="flex" flexDirection="column" alignItems="flex-end" mt={['-94px', '-44px']} mb={['60px', '30px']}>
        {isQueue ? <BatchExecuteButton items={allItems} /> : <TxFilterButton />}
      </Box>

      <BatchExecuteHoverProvider>
        {allItems.length ? <TxList items={allItems} /> : isQueue && !loading && <NoQueuedTxns />}
      </BatchExecuteHoverProvider>

      {loading && <SkeletonTxList />}

      {error && <ErrorMessage>Error loading transactions</ErrorMessage>}

      {lastPage?.next && !loading && (
        <Box my={4} textAlign="center">
          <InfiniteScroll onLoadMore={() => setPageUrl(lastPage.next)} />
        </Box>
      )}
    </Box>
  )
}

export default PaginatedTxns
