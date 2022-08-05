import type { NextPage } from 'next'
import useTxQueue from '@/hooks/useTxQueue'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'

import TransactionsIcon from '@/public/images/sidebar/transactions.svg'
import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'

const Queue: NextPage = () => {
  return (
    <main>
      <Breadcrumbs Icon={TransactionsIcon} first="Transactions" second="Queue" />

      <NavTabs tabs={transactionNavItems} />

      <PaginatedTxns useTxns={useTxQueue} />
    </main>
  )
}

export default Queue
