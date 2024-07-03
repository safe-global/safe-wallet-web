import { AppRoutes } from '@/config/routes'
import { createContext, type ReactElement, type ReactNode, useEffect, useState } from 'react'

export const GeoblockingContext = createContext<boolean | null>(null)

/**
 * Endpoint returns a 403 if the requesting user is from one of the OFAC sanctioned countries
 */
const GeoblockingProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [isBlockedCountry, setIsBlockedCountry] = useState<boolean | null>(null)

  useEffect(() => {
    const fetchSwaps = async () => {
      await fetch(AppRoutes.swap, { method: 'HEAD' }).then((res) => {
        if (res.status === 403) {
          setIsBlockedCountry(true)
        } else {
          setIsBlockedCountry(false)
        }
      })
    }

    fetchSwaps()
  }, [])

  return <GeoblockingContext.Provider value={isBlockedCountry}>{children}</GeoblockingContext.Provider>
}

export default GeoblockingProvider
