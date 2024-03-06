import chains from '@/config/chains'
import { IS_PRODUCTION } from '@/config/constants'
import { useAppSelector } from '@/store'
import { selectSession } from '@/store/sessionSlice'
import { parsePrefixedAddress } from '@/utils/addresses'
import { useParams } from 'next/navigation'
import { parse, type ParsedUrlQuery } from 'querystring'
import useChains from './useChains'
import useWallet from './wallets/useWallet'

const defaultChainId = IS_PRODUCTION ? chains.eth : chains.sep

// Use the location object directly because Next.js's router.query is available only on mount
const getLocationQuery = (): ParsedUrlQuery => {
  if (typeof location === 'undefined') return {}
  const query = parse(location.search.slice(1))
  return query
}

export const useUrlChainId = (): string | undefined => {
  const queryParams = useParams()
  const { configs } = useChains()

  // Dynamic query params
  const query = queryParams && (queryParams.safe || queryParams.chain) ? queryParams : getLocationQuery()
  const chain = query.chain?.toString() || ''
  const safe = query.safe?.toString() || ''

  const { prefix } = parsePrefixedAddress(safe)
  const shortName = prefix || chain

  if (!shortName) return undefined

  return chains[shortName] || configs.find((item) => item.shortName === shortName)?.chainId
}

const useWalletChainId = (): string | undefined => {
  const wallet = useWallet()
  const { configs } = useChains()
  const walletChainId =
    wallet?.chainId && configs.some(({ chainId }) => chainId === wallet.chainId) ? wallet.chainId : undefined
  return walletChainId
}

export const useChainId = (): string => {
  const session = useAppSelector(selectSession)
  const urlChainId = useUrlChainId()
  const walletChainId = useWalletChainId()

  return urlChainId || session.lastChainId || walletChainId || defaultChainId
}

export default useChainId
