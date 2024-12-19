import { useState, useEffect } from 'react'

export const useIsMac = (): boolean => {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(navigator.userAgent.includes('Mac'))
    }
  }, [])

  return isMac
}
