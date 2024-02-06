import { useMemo } from 'react'
import type { ChainInfo, AddressEx } from '@safe-global/safe-gateway-typescript-sdk'

import useChainId from '@/hooks/useChainId'
import useChains from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'

type SafeListItemDetails = {
  chain: ChainInfo
  safeAddress: string
  fiatBalance?: string
  threshold: number
  owners: AddressEx[]
}

const sortChainsByCurrentChain = (chains: ChainInfo[], currentChainId: string): ChainInfo[] => {
  const currentChain = chains.find(({ chainId }) => chainId === currentChainId)
  const otherChains = chains.filter(({ chainId }) => chainId !== currentChainId)
  return currentChain ? [currentChain, ...otherChains] : chains
}

export const useWatchedSafes = (): SafeListItemDetails[] => {
  const currentChainId = useChainId()
  const { configs } = useChains()
  const watchedSafes = useAppSelector(selectAllAddedSafes)
  const chains = useMemo(() => sortChainsByCurrentChain(configs, currentChainId), [configs, currentChainId])

  let watchedSafesOnAllChains: SafeListItemDetails[] = []
  for (const chain of chains) {
    const watchedSafesOnChain = watchedSafes[chain.chainId] ?? {}
    const watchedSafesAdressesOnChain = Object.keys(watchedSafesOnChain)
    const watchedSafesWithChain = watchedSafesAdressesOnChain.map((safeAddress) => {
      const { threshold, owners } = watchedSafesOnChain[safeAddress]
      return { safeAddress, chain, threshold, owners }
    })
    watchedSafesOnAllChains = [...watchedSafesOnAllChains, ...watchedSafesWithChain]
  }
  return watchedSafesOnAllChains
}
