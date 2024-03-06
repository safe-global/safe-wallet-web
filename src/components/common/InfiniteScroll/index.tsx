import useOnceVisible from '@/hooks/useOnceVisible'
import { useEffect, useRef, type ReactElement } from 'react'

const InfiniteScroll = ({ onLoadMore }: { onLoadMore: () => void }): ReactElement => {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const isVisible = useOnceVisible(elementRef)

  useEffect(() => {
    if (isVisible) {
      onLoadMore()
    }
  }, [isVisible, onLoadMore])

  return <div data-sid="61364" ref={elementRef} />
}

export default InfiniteScroll
