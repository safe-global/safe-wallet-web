import { useRouter } from 'next/router'
import chains from '@/config/chains'

const useSafeAddress = (): { address: string; chainId: string; shortName: string } => {
  const router = useRouter()
  let { safe = '' } = router.query
  if (Array.isArray(safe)) safe = safe[0]
  const [shortName, address] = safe.split(':')
  const chainId = chains[shortName]
  return { address, chainId, shortName }
}

export default useSafeAddress
