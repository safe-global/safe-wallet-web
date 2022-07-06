import { useState } from 'react'
import type { NextPage } from 'next'
import { CircularProgress } from '@mui/material'
import TxList from '@/components/transactions/TxList'
import useTxQueue from '@/hooks/useTxQueue'
import Pagination from '@/components/transactions/Pagination'
import ErrorMessage from '@/components/tx/ErrorMessage'

const Queue: NextPage = () => {
  const [pageUrl, setPageUrl] = useState<string | undefined>()
  const { isError, isLoading, data: page } = useTxQueue({ pageUrl })

  return (
    <main>
      <h2>Transaction queue</h2>

      <Pagination page={pageUrl} nextPage={page?.next} prevPage={page?.previous} onPageChange={setPageUrl} />

      {isLoading ? (
        <CircularProgress size={20} sx={{ marginTop: 2 }} />
      ) : isError ? (
        <ErrorMessage>Error loading the history</ErrorMessage>
      ) : (
        <TxList items={page?.results || []} />
      )}
    </main>
  )
}

export default Queue
