import { type ReactElement, type SyntheticEvent } from 'react'
import { Button } from '@mui/material'

type PaginationProps = {
  page?: string
  nextPage?: string | null
  prevPage?: string | null
  onPageChange: (url?: string) => void
}

const Pagination = ({ page, nextPage, prevPage, onPageChange }: PaginationProps): ReactElement => {
  const onNext = (e: SyntheticEvent) => {
    e.preventDefault()
    onPageChange(nextPage || undefined)
  }

  const onPrev = (e: SyntheticEvent) => {
    e.preventDefault()
    onPageChange(prevPage || undefined)
  }

  const onFirst = (e: SyntheticEvent) => {
    e.preventDefault()
    onPageChange(undefined)
  }

  const isFirstPage = !prevPage || page === prevPage
  const isLastPage = !nextPage || page === nextPage

  return (
    <>
      <Button onClick={onFirst} disabled={isFirstPage}>
        Go to first page
      </Button>
      <Button onClick={onPrev} disabled={isFirstPage}>
        ← Previous page
      </Button>
      <Button onClick={onNext} disabled={isLastPage}>
        Next page →
      </Button>
    </>
  )
}

export default Pagination
