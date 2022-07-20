import { type ReactElement, useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import TxList from '@/components/transactions/TxList'
import Pagination from '@/components/transactions/Pagination'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useTxHistory from '@/hooks/useTxHistory'
import useTxQueue from '@/hooks/useTxQueue'
import PagePlaceholder from '../PagePlaceholder'

const PaginatedTxns = ({ useTxns }: { useTxns: typeof useTxHistory | typeof useTxQueue }): ReactElement => {
  const [pageUrl, setPageUrl] = useState<string | undefined>()
  const { page, error, loading } = useTxns(pageUrl)
  const noTransactions = !loading && !error && page?.results.length === 0
  const showPagination = loading || page?.next || page?.previous

  const pagination = showPagination && (
    <Pagination page={pageUrl} nextPage={page?.next} prevPage={page?.previous} onPageChange={setPageUrl} />
  )

  const placeholder =
    noTransactions && useTxns === useTxQueue ? (
      <PagePlaceholder imageUrl="/images/no-transactions.svg" text="Queued transactions will appear here" />
    ) : null

  return (
    <>
      {pagination}

      {loading ? (
        <CircularProgress size={20} sx={{ marginTop: 2 }} />
      ) : error ? (
        <ErrorMessage>Error loading the history</ErrorMessage>
      ) : page?.results.length ? (
        <TxList items={page?.results} />
      ) : (
        placeholder
      )}

      <Box my={3}>{pagination}</Box>
    </>
  )
}

export default PaginatedTxns
