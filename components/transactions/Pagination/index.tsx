import { type ReactElement, type SyntheticEvent } from 'react'
import { Button } from '@mui/material'
import { useAppDispatch } from '@/store'
import { setPageUrl as setHistoryPageUrl } from '@/store/txHistorySlice'
import { setPageUrl as setQueuePageUrl } from '@/store/txQueueSlice'
import useTxHistory from '@/services/useTxHistory'
import useTxQueue from '@/services/useTxQueue'

type PaginationProps = {
  useTxns: typeof useTxHistory | typeof useTxQueue
  setPageUrl: typeof setHistoryPageUrl | typeof setQueuePageUrl
}

const Pagination = ({ useTxns, setPageUrl }: PaginationProps): ReactElement => {
  const { page, pageUrl } = useTxns()
  const dispatch = useAppDispatch()

  const onPageChange = (url?: string) => {
    dispatch(setPageUrl(url))
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
    <>
      <Button onClick={onFirst} disabled={!page.previous || pageUrl === page.previous}>
        Go to first page
      </Button>
      <Button onClick={onPrev} disabled={!page.previous || pageUrl === page.previous}>
        ← Previous page
      </Button>
      <Button onClick={onNext} disabled={!page.next || pageUrl === page.next}>
        Next page →
      </Button>
    </>
  )
}

export default Pagination
