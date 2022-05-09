import type { NextPage } from 'next'
import TxList from '@/components/transactions/TxList'
import { setPageUrl } from '@/store/txQueueSlice'
import useTxQueue from '@/services/useTxQueue'
import Pagination from '@/components/transactions/Pagination'

const Queue: NextPage = () => {
  const { page } = useTxQueue()

  return (
    <main>
      <h2>Transaction Queue</h2>

      <Pagination useTxns={useTxQueue} setPageUrl={setPageUrl} />

      <TxList items={page.results} />
    </main>
  )
}

export default Queue
