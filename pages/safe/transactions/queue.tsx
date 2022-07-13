import type { NextPage } from 'next'
import useTxQueue from '@/hooks/useTxQueue'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import TransactionsIcon from '@/public/images/sidebar/transactions.svg'

const Queue: NextPage = () => {
  return (
    <main>
      <Breadcrumbs icon={TransactionsIcon} parent="Transactions" child="Queue" />

      <PaginatedTxns useTxns={useTxQueue} />
    </main>
  )
}

export default Queue
