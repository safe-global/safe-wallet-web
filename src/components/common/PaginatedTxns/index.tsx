import { type ReactElement, useState } from 'react'
import { Box } from '@mui/material'
import TxList from '@/components/transactions/TxList'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useTxHistory from '@/hooks/useTxHistory'
import useTxQueue from '@/hooks/useTxQueue'
import PagePlaceholder from '../PagePlaceholder'
import InfiniteScroll from '../InfiniteScroll'
import SkeletonTxList from './SkeletonTxList'

const NoQueuedTxns = () => (
  <Box mt="5vh">
    <PagePlaceholder imageUrl="/images/no-transactions.svg" text="Queued transactions will appear here" />
  </Box>
)

const TxPage = ({
  pageUrl,
  useTxns,
  onNextPage,
}: {
  pageUrl: string
  useTxns: typeof useTxHistory | typeof useTxQueue
  onNextPage?: (pageUrl?: string) => void
}): ReactElement => {
  const { page, error } = useTxns(pageUrl)

  if (page) {
    const isQueue = useTxns === useTxQueue

    return (
      <>
        {page.results && (isQueue && !page.results.length ? <NoQueuedTxns /> : <TxList items={page.results} />)}

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
          onNextPage={index === pages.length - 1 ? onNextPage : undefined}
        />
      ))}
    </Box>
  )
}

export default PaginatedTxns
