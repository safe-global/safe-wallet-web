import { type ReactElement, useState, useEffect } from 'react'
import { type TransactionListItem } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box } from '@mui/material'
import TxList from '@/components/transactions/TxList'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useTxHistory from '@/hooks/useTxHistory'
import useTxQueue from '@/hooks/useTxQueue'
import PagePlaceholder from '../PagePlaceholder'
import LoadMoreButton from '../LoadMoreButton'
import SkeletonTxList from './SkeletonTxList'

const PaginatedTxns = ({ useTxns }: { useTxns: typeof useTxHistory | typeof useTxQueue }): ReactElement => {
  const [pageUrl, setPageUrl] = useState<string | undefined>()
  const [allResults, setAllResults] = useState<TransactionListItem[]>([])
  const { page, error, loading } = useTxns(pageUrl)

  useEffect(() => {
    if (page?.results.length) {
      setAllResults((prev) => prev.concat(page.results))
    }
  }, [page])

  return (
    <Box mb={4} position="relative">
      {allResults.length ? (
        <TxList items={allResults} />
      ) : error ? (
        <ErrorMessage>Error loading the history</ErrorMessage>
      ) : loading ? (
        <SkeletonTxList />
      ) : (
        useTxns === useTxQueue && (
          <Box mt="5vh">
            <PagePlaceholder imageUrl="/images/no-transactions.svg" text="Queued transactions will appear here" />
          </Box>
        )
      )}

      {(page?.next || loading) && (
        <Box my={4} textAlign="center">
          <LoadMoreButton onLoadMore={() => setPageUrl(page?.next)} loading={loading} />
        </Box>
      )}
    </Box>
  )
}
export default PaginatedTxns
