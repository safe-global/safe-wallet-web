import { useRouter } from 'next/router'

import { useAppSelector } from 'store'
import { selectChains } from 'store/chainsSlice'

const useSafeAddress = (): { address: string; chainId: string } => {
  const chains = useAppSelector(selectChains)
  const router = useRouter()
  let { safeAddress = '' } = router.query

  if (Array.isArray(safeAddress)) {
    safeAddress = safeAddress[0]
  }

  const [prefix, address] = safeAddress.split(':')
  const chainId = chains.find(({ shortName }) => shortName === prefix)?.chainId || ''

  return { address, chainId }
}

export default useSafeAddress
