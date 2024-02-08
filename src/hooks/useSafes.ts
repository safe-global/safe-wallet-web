import { useMemo } from 'react'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { getBalances } from '@safe-global/safe-gateway-typescript-sdk'
import { getAllOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'
import useChainId from '@/hooks/useChainId'
import useChains from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import useAsync from './useAsync'
import useWallet from './wallets/useWallet'

export type Safe = {
  chainId: string
  address: string
}

const CURRENCY = 'USD'

const sortChainsByCurrentChain = (chains: ChainInfo[], currentChainId: string): ChainInfo[] => {
  const currentChain = chains.find(({ chainId }) => chainId === currentChainId)
  const otherChains = chains.filter(({ chainId }) => chainId !== currentChainId)
  return currentChain ? [currentChain, ...otherChains] : chains
}
const sortSafesByCurrentChain = (safes: Safe[], currentChainId: string | undefined): Safe[] => {
  if (!currentChainId) return safes

  const safesOnCurrentChain = safes.filter((safe) => safe.chainId === currentChainId)
  const safesNotOnCurrentChain = safes.filter((safe) => safe.chainId !== currentChainId)

  return [...safesOnCurrentChain, ...safesNotOnCurrentChain]
}

export const useOwnedSafes = (): [Safe[], Error | undefined, boolean] => {
  const currentChainId = useChainId()
  const wallet = useWallet()

  const [allOwnedSafes, error, loading] = useAsync(() => {
    if (!wallet) return
    return getAllOwnedSafes(wallet.address)
  }, [wallet])

  const ownedSafeEntries = Object.entries(allOwnedSafes ?? {})

  const ownedSafeList: Safe[] = ownedSafeEntries.flatMap(([chainId, chainSafes]) =>
    chainSafes.map((address) => ({ chainId, address })),
  )

  const sortedSafesList = useMemo(
    () => sortSafesByCurrentChain(ownedSafeList, currentChainId),
    [ownedSafeList, currentChainId],
  )
  return [sortedSafesList, error, loading]
}

export const useWatchedSafes = (): Safe[] => {
  const currentChainId = useChainId()
  const { configs } = useChains()
  const watchedSafes = useAppSelector(selectAllAddedSafes)
  const chains = useMemo(() => sortChainsByCurrentChain(configs, currentChainId), [configs, currentChainId])

  let watchedSafesOnAllChains: Safe[] = []
  for (const chain of chains) {
    const { chainId } = chain
    const watchedSafesOnChain = watchedSafes[chainId] ?? {}
    const watchedSafesAdressesOnChain = Object.keys(watchedSafesOnChain)
    const watchedSafesWithChain = watchedSafesAdressesOnChain.map((address) => {
      return { address, chainId }
    })
    watchedSafesOnAllChains = [...watchedSafesOnAllChains, ...watchedSafesWithChain]
  }
  return watchedSafesOnAllChains
}

export const useLoadSafeList = (safes: Safe[]) => {
  const [safeInfoList] = useAsync(() => {
    const promises = safes.map(async ({ address, chainId }) => {
      const balance = await getBalances(chainId, address, CURRENCY).then((result) => result.fiatTotal)
      return { address, chainId, balance }
    })
    return Promise.all(promises)
  }, [safes])

  return safeInfoList
}
