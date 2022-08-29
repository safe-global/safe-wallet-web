import { type ReactElement, useState } from 'react'
import { Box } from '@mui/material'
import TxList from '@/components/transactions/TxList'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useTxHistory from '@/hooks/useTxHistory'
import useTxQueue from '@/hooks/useTxQueue'
import PagePlaceholder from '../PagePlaceholder'
import InfiniteScroll from '../InfiniteScroll'
import SkeletonTxList from './SkeletonTxList'
import BatchExecuteButton from '@/components/transactions/BatchExecuteButton'
import TxFilterButton from '@/components/transactions/TxFilterButton'

const NoQueuedTxns = () => (
  <Box mt="5vh">
    <PagePlaceholder imageUrl="/images/no-transactions.svg" text="Queued transactions will appear here" />
  </Box>
)

const TxPage = ({
  pageUrl,
  useTxns,
  onNextPage,
  isFirstPage,
}: {
  pageUrl: string
  useTxns: typeof useTxHistory | typeof useTxQueue
  onNextPage?: (pageUrl?: string) => void
  isFirstPage: boolean
}): ReactElement => {
  const { page, error } = useTxns(pageUrl)

  if (page?.results) {
    const isQueue = useTxns === useTxQueue

    return (
      <>
        {/* FIXME: batching will only work for the first page results */}
        {isFirstPage && (
          <Box display="flex" flexDirection="column" alignItems="flex-end" mt={['-94px', '-44px']} mb={['60px', 0]}>
            {isQueue ? <BatchExecuteButton items={page.results} /> : <TxFilterButton />}
          </Box>
        )}

        {page.results.length ? <TxList items={page.results} /> : isQueue && <NoQueuedTxns />}

        {onNextPage && page.next && (
          <Box my={4} textAlign="center">
            <InfiniteScroll onLoadMore={() => onNextPage(page.next)} />
          </Box>
        )}
      </>
    )
  }

  if (error) {
    return <ErrorMessage>Error loading transactions</ErrorMessage>
  }

  return <SkeletonTxList />
}

const PaginatedTxns = ({ useTxns }: { useTxns: typeof useTxHistory | typeof useTxQueue }): ReactElement => {
  const [pages, setPages] = useState<string[]>([''])

  const onNextPage = (pageUrl = '') => {
    setPages((prev) => [...prev, pageUrl])
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
