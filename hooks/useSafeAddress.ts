import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { parsePrefixedAddress } from '@/utils/addresses'

const defaultAddress = '0x0000000000000000000000000000000000000000'

const useSafeAddress = (): string => {
  const router = useRouter()
  const { safe = '' } = router.query
  const fullAddress = Array.isArray(safe) ? safe[0] : safe

  const checksummedAddress = useMemo(() => {
    if (!fullAddress) return ''
    const { address } = parsePrefixedAddress(fullAddress)
    return address
  }, [fullAddress])

  // A Safe route, but no query
  if (!checksummedAddress && router.pathname.includes('/safe/')) {
    return defaultAddress
  }

  return checksummedAddress
}

export default useSafeAddress
