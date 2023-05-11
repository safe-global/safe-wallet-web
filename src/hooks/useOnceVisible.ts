import { useEffect, useState } from 'react'
import type { MutableRefObject } from 'react'

// A hook to detect when an element is visible in the viewport for the first time
const useOnceVisible = (element: MutableRefObject<HTMLElement | null>): boolean => {
  const [onceVisible, setOnceVisible] = useState<boolean>(false)

  useEffect(() => {
    if (!element.current) return

    const observer = new IntersectionObserver((entries) => {
      const intersectingEntry = entries.find((entry) => entry.isIntersecting)
      if (intersectingEntry) {
        setOnceVisible(true)
        observer.unobserve(intersectingEntry.target)
      }
    })

    observer.observe(element.current)

    return () => {
      observer.disconnect()
    }
  }, [element])

  return onceVisible
}

export default useOnceVisible
