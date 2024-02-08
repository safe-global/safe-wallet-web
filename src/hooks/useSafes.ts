import { useMemo } from 'react'
import type { ChainInfo, AddressEx } from '@safe-global/safe-gateway-typescript-sdk'
import { getAllOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'
import useChainId from '@/hooks/useChainId'
import useChains from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import useAsync from './useAsync'
import useWallet from './wallets/useWallet'

type SafeListItemDetails = {
  chain: ChainInfo
  safeAddress: string
  fiatBalance?: string
  threshold: number
  owners: AddressEx[]
}

type SafeListItem = {
  chainId: string
  safeAddress: string
}

const sortChainsByCurrentChain = (chains: ChainInfo[], currentChainId: string): ChainInfo[] => {
  const currentChain = chains.find(({ chainId }) => chainId === currentChainId)
  const otherChains = chains.filter(({ chainId }) => chainId !== currentChainId)
  return currentChain ? [currentChain, ...otherChains] : chains
}
const sortSafesByCurrentChain = (safes: SafeListItem[], currentChainId: string | undefined): SafeListItem[] => {
  if (!currentChainId) return safes

  const safesOnCurrentChain = safes.filter((safe) => safe.chainId === currentChainId)
  const safesNotOnCurrentChain = safes.filter((safe) => safe.chainId !== currentChainId)

  return [...safesOnCurrentChain, ...safesNotOnCurrentChain]
}

export const useOwnedSafes = (): [SafeListItem[], Error | undefined, boolean] => {
  const currentChainId = useChainId()
  const wallet = useWallet()

  const [allOwnedSafes, error, loading] = useAsync(() => {
    if (!wallet) return
    return getAllOwnedSafes(wallet.address)
  }, [wallet])

  const ownedSafeEntries = Object.entries(allOwnedSafes ?? {})

  const ownedSafeList: SafeListItem[] = ownedSafeEntries.flatMap(([chainId, chainSafes]) =>
    chainSafes.map((safeAddress) => ({ chainId, safeAddress })),
  )

  const sortedSafesList = useMemo(
    () => sortSafesByCurrentChain(ownedSafeList, currentChainId),
    [ownedSafeList, currentChainId],
  )
  return [sortedSafesList, error, loading]
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
