import type { NextPage } from 'next'
import useTxHistory from '@/hooks/useTxHistory'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import TransactionsIcon from '@/public/images/sidebar/transactions.svg'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { PaddedMain } from '@/components/common/PaddedMain'

const History: NextPage = () => {
  return (
    <PaddedMain>
      <Breadcrumbs Icon={TransactionsIcon} first="Transactions" second="History" />

      <NavTabs tabs={transactionNavItems} />

      <PaginatedTxns useTxns={useTxHistory} />
    </PaddedMain>
  )
}

export default History
