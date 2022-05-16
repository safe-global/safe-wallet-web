import useSafeAddress from '@/services/useSafeAddress'
import { useRouter } from 'next/router'
import { IS_PRODUCTION } from '@/config/constants'
import chains from '@/config/chains'

export const useCurrentNetwork = (): string => {
  const router = useRouter()
  const chain = Array.isArray(router.query.chain) ? router.query.chain[0] : router.query.chain || ''
  const fallbackChainId = IS_PRODUCTION ? chains.eth : chains.rin
  const fallbackShortName = Object.entries(chains).find(([, value]) => value === fallbackChainId)?.[0]
  const { shortName } = useSafeAddress()

  return chain || shortName || fallbackShortName || ''
}
