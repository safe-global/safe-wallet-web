import { useRouter } from 'next/router'
import { IS_PRODUCTION } from '@/config/constants'
import chains from '@/config/chains'

export const useChainId = (): string => {
  const router = useRouter()
  const chain = Array.isArray(router.query.chain) ? router.query.chain[0] : router.query.chain || ''
  const safe = Array.isArray(router.query.safe) ? router.query.safe[0] : router.query.safe || ''
  const shortName = safe.split(':')[0]
  const fallbackChainId = IS_PRODUCTION ? chains.eth : chains.rin
  const currentShortName = chain || shortName

  return currentShortName
    ? Object.entries(chains).find(([key]) => key === currentShortName)?.[1] || ''
    : fallbackChainId
}
