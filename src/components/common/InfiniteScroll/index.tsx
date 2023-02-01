import { useEffect, useRef, type ReactElement } from 'react'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'

const InfiniteScroll = ({ onLoadMore }: { onLoadMore: () => void }): ReactElement => {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const isIntersecting = useIntersectionObserver(elementRef)

  useEffect(() => {
    if (isIntersecting) {
      onLoadMore()
    }
  }, [isIntersecting, onLoadMore])

  return <div ref={elementRef} />
}

export default InfiniteScroll
