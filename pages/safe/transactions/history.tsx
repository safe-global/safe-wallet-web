import type { SyntheticEvent } from 'react'
import type { NextPage } from 'next'

import TxList from '@/components/transactions/TxList'
import { useAppDispatch } from '@/store'
import { fetchTxHistory } from '@/store/txHistorySlice'
import useTxHistory from '@/services/useTxHistory'
import useSafeAddress from '@/services/useSafeAddress'

const History: NextPage = () => {
  const { page } = useTxHistory()
  const { chainId, address } = useSafeAddress()
  const dispatch = useAppDispatch()

  const isFirstPage = !page.previous && !page.next

  const onPageChange = (pageUrl?: string) => {
    dispatch(fetchTxHistory({ chainId, address, pageUrl }))
  }

  const onNext = (e: SyntheticEvent) => {
    e.preventDefault()
    onPageChange(page.next)
  }

  const onPrev = (e: SyntheticEvent) => {
    e.preventDefault()
    onPageChange(page.previous)
  }

  const onFirst = (e: SyntheticEvent) => {
    e.preventDefault()
    onPageChange(undefined)
  }

  return (
    <main>
      <h2>Transaction History</h2>

      <button onClick={onFirst} disabled={isFirstPage}>
        Go to first page
      </button>
      <button onClick={onPrev} disabled={!page.previous}>
        ← Previous page
      </button>
      <button onClick={onNext} disabled={!page.next}>
        Next page →
      </button>

      <TxList items={page.results} />
    </main>
  )
}

export default History
