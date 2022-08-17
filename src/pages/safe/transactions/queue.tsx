import type { NextPage } from 'next'
import Head from 'next/head'
import useTxQueue from '@/hooks/useTxQueue'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import TransactionsIcon from '@/public/images/sidebar/transactions.svg'
import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { trackEvent } from '@/services/analytics/analytics'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import { useEffect } from 'react'

const Queue: NextPage = () => {
  const { loading, page } = useTxQueue()

  useEffect(() => {
    if (loading) {
      return
    }

    const count = page?.results.length ?? 0

    if (count > 0) {
      trackEvent({
        ...TX_LIST_EVENTS.QUEUED_TXS,
        label: count,
      })
    }
  }, [loading, page])

  return (
    <main>
      <Head>
        <title>Safe – Transaction queue</title>
      </Head>

      <Breadcrumbs Icon={TransactionsIcon} first="Transactions" second="Queue" />

      <NavTabs tabs={transactionNavItems} />

      <PaginatedTxns useTxns={useTxQueue} />
    </main>
  )
}

export default Queue
