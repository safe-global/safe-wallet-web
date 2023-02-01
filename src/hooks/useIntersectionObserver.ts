import { type MutableRefObject, useEffect, useRef, useState, useCallback } from 'react'

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

export default useIntersectionObserver
