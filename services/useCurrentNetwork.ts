import useSafeAddress from '@/services/useSafeAddress'
import { useRouter } from 'next/router'
import { IS_PRODUCTION } from '@/config/constants'

export const useCurrentNetwork = (): string => {
  const router = useRouter()
  const chain = Array.isArray(router.query.chain) ? router.query.chain[0] : router.query.chain || ''
  const fallbackChain = IS_PRODUCTION ? 'eth' : 'rin'
  const { shortName } = useSafeAddress()

  return chain || shortName || fallbackChain
}
