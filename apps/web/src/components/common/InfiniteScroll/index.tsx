import { useEffect, useRef, type ReactElement } from 'react'
import useOnceVisible from '@/hooks/useOnceVisible'

const InfiniteScroll = ({ onLoadMore }: { onLoadMore: () => void }): ReactElement => {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const isVisible = useOnceVisible(elementRef)

  useEffect(() => {
    if (isVisible) {
      onLoadMore()
    }
  }, [isVisible, onLoadMore])

  return <div ref={elementRef} />
}

export default InfiniteScroll
