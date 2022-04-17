import { useRouter } from 'next/router'
import chains from 'config/chains'

const useSafeAddress = (): { address: string; chainId: string } => {
  const router = useRouter()
  let { safe = '' } = router.query
  if (Array.isArray(safe)) safe = safe[0]
  const [prefix, address] = safe.split(':')
  const chainId = chains[prefix]
  return { address, chainId }
}

export default useSafeAddress
