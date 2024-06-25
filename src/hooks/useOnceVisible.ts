import { useEffect, useMemo, useState } from 'react'
import type { MutableRefObject } from 'react'

// A hook to detect when an element is visible in the viewport for the first time
const useOnceVisible = (element: MutableRefObject<HTMLElement | null>): boolean => {
  const [onceVisible, setOnceVisible] = useState<boolean>(false)

  // Create and memoize an instance of IntersectionObserver
  const observer = useMemo(() => {
    if (typeof IntersectionObserver === 'undefined') return

    return new IntersectionObserver((entries) => {
      const intersectingEntry = entries.find((entry) => entry.isIntersecting)
      if (intersectingEntry) {
        setOnceVisible(true)
        observer?.unobserve(intersectingEntry.target)
      }
    })
  }, [])

  // Disconnect the observer on unmount
  useEffect(() => {
    return () => {
      observer?.disconnect()
    }
  }, [observer])

  // Observe the target element
  useEffect(() => {
    const target = element.current

    if (target) {
      observer?.observe(target)
    }

    return () => {
      if (target) {
        observer?.unobserve(target)
      }
    }
  }, [observer, element])

  return onceVisible
}

export default useOnceVisible
