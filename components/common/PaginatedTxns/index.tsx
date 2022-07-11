import { type ReactElement, useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import TxList from '@/components/transactions/TxList'
import Pagination from '@/components/transactions/Pagination'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useTxHistory from '@/hooks/useTxHistory'
import useTxQueue from '@/hooks/useTxQueue'

const PaginatedTxns = ({ useTxns }: { useTxns: typeof useTxHistory | typeof useTxQueue }): ReactElement => {
  const [pageUrl, setPageUrl] = useState<string | undefined>()
  const { page, error, loading } = useTxns(pageUrl)

  const pagination = (
    <Pagination page={pageUrl} nextPage={page?.next} prevPage={page?.previous} onPageChange={setPageUrl} />
  )

  return (
    <>
      {pagination}

      {loading ? (
        <CircularProgress size={20} sx={{ marginTop: 2 }} />
      ) : error ? (
        <ErrorMessage>Error loading the history</ErrorMessage>
      ) : (
        <TxList items={page?.results || []} />
      )}

      <Box my={3}>{pagination}</Box>
    </>
  )
}

export default PaginatedTxns
