import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import useTxQueue from '@/hooks/useTxQueue'
import HistoryPage from './history'

const TransactionsPage: NextPage = () => {
  const router = useRouter()
  const { page } = useTxQueue()
  const hasQueuedTxs = !!page?.results.length

  useEffect(() => {
    const pathname = hasQueuedTxs ? AppRoutes.transactions.queue : AppRoutes.transactions.history

    router.push({
      pathname,
      query: { safe: router.query.safe },
    })
  }, [router, hasQueuedTxs])

  return <HistoryPage />
}

export default TransactionsPage
