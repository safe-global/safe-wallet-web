import { type MutableRefObject, useCallback, useEffect, useRef, useState, type ReactElement } from 'react'
import { Button } from '@mui/material'

const useIntersectionObserver = (element: MutableRefObject<HTMLElement | null>): boolean => {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false)
  const observer = useRef<IntersectionObserver | undefined>()

  const callback = useCallback(([entry]: IntersectionObserverEntry[]) => {
    setIsIntersecting(entry.isIntersecting)
  }, [])

  useEffect(() => {
    observer.current?.disconnect()
    observer.current = undefined

    if (!element.current) return

    observer.current = new IntersectionObserver(callback)

    observer.current.observe(element.current)

    return () => {
      observer.current?.disconnect()
      observer.current = undefined
    }
  }, [callback])

  return isIntersecting
}

const LoadMoreButton = ({ onLoadMore, loading }: { onLoadMore: () => void; loading: boolean }): ReactElement => {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const isIntersecting = useIntersectionObserver(buttonRef)

  useEffect(() => {
    if (isIntersecting && !loading) {
      onLoadMore()
    }
  }, [isIntersecting, loading, onLoadMore])

  return (
    <Button onClick={onLoadMore} variant="outlined" disabled={loading} ref={buttonRef}>
      Load more
    </Button>
  )
}

export default LoadMoreButton
