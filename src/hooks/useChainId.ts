import { useRouter } from 'next/router'
import { parse } from 'querystring'
import { IS_PRODUCTION } from '@/config/constants'
import chains from '@/config/chains'
import { useAppSelector } from '@/store'
import { selectSession } from '@/store/sessionSlice'
import { parsePrefixedAddress } from '@/utils/addresses'

const defaultChainId = IS_PRODUCTION ? chains.eth : chains.gor

// Use the location object directly because Next.js's router.query is not available initially
const getUrlSafeParam = (): string => {
  if (typeof location === 'undefined') return ''
  const pathParam = location.pathname.split('/')[1]
  const safeParam = /[a-z0-9-]+\:0x[a-f0-9]{40}/i.test(pathParam) ? pathParam : ''
  return safeParam
}

const getUrlChainParam = (): string => {
  if (typeof location === 'undefined') return ''
  const query = parse(location.search.slice(1))
  return query.chain ? query.chain.toString() : ''
}

export const useUrlChainId = (): string | undefined => {
  const router = useRouter()
  const chain = router.query.chain?.toString() || getUrlChainParam()
  const safe = router.query.safe?.toString() || getUrlSafeParam()

  const { prefix } = parsePrefixedAddress(safe)
  const shortName = prefix || chain

  if (shortName) {
    const chainId = Object.entries(chains).find(([key]) => key === shortName)?.[1]
    if (chainId == null) {
      throw Error('Invalid chain short name in the URL')
    }
    return chainId
  }
}

export const useChainId = (): string => {
  const session = useAppSelector(selectSession)
  const urlChainId = useUrlChainId()
  return urlChainId || session.lastChainId || defaultChainId
}

export default useChainId
