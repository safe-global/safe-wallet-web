import TxList from '@/components/transactions/TxList'
import type { NextPage } from 'next'
import { useAppDispatch, useAppSelector } from 'store'
import { selectTxQueue, setPageUrl } from '@/store/txQueueSlice'

const preventDefault = (fn: () => void): ((e: React.SyntheticEvent) => void) => {
  return (e) => {
    e.preventDefault()
    fn()
  }
}

const Queue: NextPage = () => {
  const { page, pageUrl } = useAppSelector(selectTxQueue)
  const dispatch = useAppDispatch()

  const onPageChange = (url?: string) => {
    dispatch(setPageUrl(url))
  }

  const onNext = preventDefault(() => {
    onPageChange(page.next)
  })

  const onPrev = preventDefault(() => {
    onPageChange(page.previous)
  })

  const onFirst = preventDefault(() => {
    onPageChange(undefined)
  })

  return (
    <main>
      <h2>Transaction Queue</h2>

      <button onClick={onFirst} disabled={!pageUrl}>
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
