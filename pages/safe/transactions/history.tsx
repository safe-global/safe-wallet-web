import type { NextPage } from 'next'
import TxList from '@/components/transactions/TxList'
import { setPageUrl } from '@/store/txHistorySlice'
import useTxHistory from '@/hooks/useTxHistory'
import Pagination from '@/components/transactions/Pagination'

const History: NextPage = () => {
  const { page } = useTxHistory()

  return (
    <main>
      <h2>Transaction History</h2>

      <Pagination useTxns={useTxHistory} setPageUrl={setPageUrl} />

      <TxList items={page.results} />
    </main>
  )
}

export default History
