import type { NextPage } from 'next'
import useTxHistory from '@/hooks/useTxHistory'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import TransactionsIcon from '@/public/images/sidebar/transactions.svg'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'

const History: NextPage = () => {
  return (
    <main>
      <Breadcrumbs icon={TransactionsIcon} parent="Transactions" child="History" />

      <PaginatedTxns useTxns={useTxHistory} />
    </main>
  )
}

export default History
