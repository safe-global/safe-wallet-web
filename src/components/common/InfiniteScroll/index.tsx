import { type MutableRefObject, useEffect, useRef, useState, type ReactElement, useCallback } from 'react'

const useIntersectionObserver = (element: MutableRefObject<HTMLElement | null>): boolean => {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false)
  const observer = useRef<IntersectionObserver | undefined>()

  const callback = useCallback(([entry]: IntersectionObserverEntry[]) => {
    setIsIntersecting(entry.isIntersecting)
  }, [])

  useEffect(() => {
    if (element.current) {
      observer.current = new IntersectionObserver(callback)

      observer.current.observe(element.current)
    }

    return () => {
      observer.current?.disconnect()
      observer.current = undefined
    }
  }, [callback, element])

  return isIntersecting
}

const InfiniteScroll = ({ onLoadMore }: { onLoadMore: () => void }): ReactElement => {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const isIntersecting = useIntersectionObserver(elementRef)

  useEffect(() => {
    if (isIntersecting) {
      onLoadMore()
    }
  }, [isIntersecting, onLoadMore])

  return <div ref={elementRef} style={{ height: '1px' }} />
}

export default InfiniteScroll
