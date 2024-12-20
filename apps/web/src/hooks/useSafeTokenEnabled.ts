import { useContext } from 'react'
import { GeoblockingContext } from '@/components/common/GeoblockingProvider'
import useSafeInfo from './useSafeInfo'
import { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'

export function useSafeTokenEnabled(): boolean {
  const isBlockedCountry = useContext(GeoblockingContext)
  const { safe, safeLoaded } = useSafeInfo()
  return !isBlockedCountry && safeLoaded && !!getSafeTokenAddress(safe.chainId)
}
