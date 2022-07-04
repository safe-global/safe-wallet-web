import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { getAddress } from 'ethers/lib/utils'

const useSafeAddress = (): string => {
  const router = useRouter()
  const { safe = '' } = router.query
  const fullAddress = Array.isArray(safe) ? safe[0] : safe

  const address = useMemo(() => {
    const bareAddress = fullAddress.split(':').pop()
    return bareAddress ? getAddress(bareAddress) : ''
  }, [fullAddress])

  return address
}

export default useSafeAddress
