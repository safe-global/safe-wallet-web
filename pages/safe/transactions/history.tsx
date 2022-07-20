import type { NextPage } from 'next'
import useTxHistory from '@/hooks/useTxHistory'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import TransactionsIcon from '@/public/images/sidebar/transactions.svg'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import NavTabs from '@/components/common/NavTabs'
import { transactionItems } from '@/components/sidebar/SidebarNavigation/config'

const History: NextPage = () => {
  return (
    <main>
      <Breadcrumbs Icon={TransactionsIcon} first="Transactions" second="History" />

      <NavTabs tabs={transactionItems.items!} />

      <PaginatedTxns useTxns={useTxHistory} />
    </main>
  )
}

export default History
