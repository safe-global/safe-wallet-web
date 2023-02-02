import { useEffect, useState } from 'react'
import type { MutableRefObject } from 'react'

const useOnceVisible = (element: MutableRefObject<HTMLElement | null>): boolean => {
  const [onceVisible, setOnceVisible] = useState<boolean>(false)

  useEffect(() => {
    if (!element.current || onceVisible) {
      return
    }

    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      // Firefox returns multiple entries, of which one will be true when intersecting
      const isIntersecting = entries.some(({ isIntersecting }) => isIntersecting)
      if (isIntersecting) {
        setOnceVisible(true)
      }
    })

    observer.observe(element.current)

    return () => {
      observer.disconnect()
    }
  }, [element, onceVisible])

  return onceVisible
}

export default useOnceVisible
