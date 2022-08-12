import type { NextPage } from 'next'
import Head from 'next/head'
import useTxHistory from '@/hooks/useTxHistory'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import TransactionsIcon from '@/public/images/sidebar/transactions.svg'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'

const History: NextPage = () => {
  return (
    <main>
      <Head>
        <title>Safe – Transaction history</title>
      </Head>

      <Breadcrumbs Icon={TransactionsIcon} first="Transactions" second="History" />

      <NavTabs tabs={transactionNavItems} />

      <PaginatedTxns useTxns={useTxHistory} />
    </main>
  )
}

export default History
