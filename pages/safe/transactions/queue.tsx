import type { NextPage } from 'next'
import useTxQueue from '@/hooks/useTxQueue'
import PaginatedTxns from '@/components/common/PaginatedTxns'

const Queue: NextPage = () => {
  return (
    <main>
      <h2>Transaction queue</h2>

      <PaginatedTxns useTxns={useTxQueue} />
    </main>
  )
}

export default Queue
