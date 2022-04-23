import type { SyntheticEvent } from 'react'
import type { NextPage } from 'next'

import TxList from '@/components/transactions/TxList'
import { useAppDispatch } from '@/store'
import { fetchTxQueue } from '@/store/txQueueSlice'
import useTxQueue from '@/services/useTxQueue'
import useSafeAddress from '@/services/useSafeAddress'

const Queue: NextPage = () => {
  const { page } = useTxQueue()
  const { chainId, address } = useSafeAddress()
  const dispatch = useAppDispatch()

  const onPageChange = (pageUrl?: string) => {
    dispatch(fetchTxQueue({ chainId, address, pageUrl }))
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
      <h2>Transaction Queue</h2>

      <button onClick={onFirst} disabled={!page.previous && !page.next}>
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

export default Queue
