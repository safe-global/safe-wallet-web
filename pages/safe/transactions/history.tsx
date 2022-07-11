import type { NextPage } from 'next'
import useTxHistory from '@/hooks/useTxHistory'
import PaginatedTxns from '@/components/common/PaginatedTxns'

const History: NextPage = () => {
  return (
    <main>
      <h2>Transaction history</h2>

      <PaginatedTxns useTxns={useTxHistory} />
    </main>
  )
}

export default History
