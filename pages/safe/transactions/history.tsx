import { useState } from 'react'
import type { NextPage } from 'next'
import TxList from '@/components/transactions/TxList'
import useTxHistory from '@/hooks/useTxHistory'
import Pagination from '@/components/transactions/Pagination'
import ErrorMessage from '@/components/tx/ErrorMessage'

const History: NextPage = () => {
  const [pageUrl, setPageUrl] = useState<string | undefined>()
  const { page, loading } = useTxHistory(pageUrl)

  return (
    <main>
      <h2>Transaction history</h2>

      <Pagination page={pageUrl} nextPage={page?.next} prevPage={page?.previous} onPageChange={setPageUrl} />

      {loading ? (
        'Loading...'
      ) : !page ? (
        <ErrorMessage>Error loading the history</ErrorMessage>
      ) : (
        <TxList items={page?.results || []} />
      )}
    </main>
  )
}

export default History
