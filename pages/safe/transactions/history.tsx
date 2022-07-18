import type { NextPage } from 'next'
import useTxHistory from '@/hooks/useTxHistory'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import TransactionsIcon from '@/public/images/sidebar/transactions.svg'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'

const History: NextPage = () => {
  return (
    <main>
      <Breadcrumbs Icon={TransactionsIcon} first="Transactions" second="History" />

      <PaginatedTxns useTxns={useTxHistory} />
    </main>
  )
}

export default History
