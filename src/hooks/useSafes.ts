import { useEffect, useMemo, useState } from 'react'
import { ChainInfo, getOwnedSafes, getBalances, type SafeBalanceResponse  } from '@safe-global/safe-gateway-typescript-sdk'

import useWallet from '@/hooks/wallets/useWallet'
import useChainId from '@/hooks/useChainId'
import useChains from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import useAsync from './useAsync'

type SafeListItemDetails = {
  chain: ChainInfo
  safeAddress: string
  fiatBalance?: string
}

const getWalletSafes = async (walletAddress?: string, chainId?: string) => {
  if (!walletAddress || !chainId) return
  return getOwnedSafes(chainId, walletAddress)
}

const sortChainsByCurrentChain = (chains: ChainInfo[], currentChainId: string): ChainInfo[] => {
  const currentChain = chains.find(({ chainId }) => chainId === currentChainId);
  const otherChains= chains.filter(({ chainId }) => chainId !== currentChainId);
  return currentChain ? [currentChain, ...otherChains] : chains;
}

/**
 * Fetch all safes owned by the current wallet up to a certain limit.
 * The hook loads safes sequentially from all chains, updating its state as it goes.
 */
export const useOwnedSafes = (safesToFetch: number, startChainId?: string): [SafeListItemDetails[], Error | undefined, boolean] => {
  const wallet = useWallet()
  const currentChainId = useChainId()
  const { configs } = useChains()

  const chains = useMemo(() => sortChainsByCurrentChain(configs, currentChainId), [configs, currentChainId])

  const [allSafes, setAllSafes] = useState<SafeListItemDetails[]>([])
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState<boolean>(false)

  // Reset state when the wallet address or current chain changes
  useEffect(() => {
    setAllSafes([])
    setError(undefined)
    setLoading(false)
  }, [wallet, currentChainId])

  // Fetch safes sequentially from all chains
  useEffect(() => {
    let current = true
    const load = async (index: number) => {
      const chain = chains[index]
      if (!current || !wallet) return

      let chainSafes
      try {
        chainSafes = await getWalletSafes(wallet.address, chain.chainId)
      } catch (error) {
        setError(error as Error)
      }

      const ownedSafesOnChain = await Promise.all(
        (chainSafes?.safes || []).map(async (safeAddress) => {
        const {fiatTotal: fiatBalance} =  await getBalances(chain.chainId, safeAddress, 'USD')
        return  { safeAddress, chain, fiatBalance }
      }))

      setAllSafes((prevSafes) => {
        const newAllSafes = [...prevSafes, ...ownedSafesOnChain]
        if (safesToFetch > newAllSafes.length && index < chains.length - 1) {
          load(index + 1)
        } else {
          setLoading(false)
        }
       return newAllSafes
      })
    }

    if (safesToFetch > 0) {
      const startIndex = startChainId ? chains.findIndex((chain) => chain.chainId === startChainId) + 1 : 0
      if (startIndex < chains.length) {
        load(startIndex)
        setLoading(true)
      }
    }

    return () => {
      current = false
    }
  }, [wallet, chains, startChainId])

  return [allSafes, error, loading]
}

export const useWatchedSafes = () : [SafeListItemDetails[], Error | undefined, boolean] => {
  const currentChainId = useChainId()
  const { configs } = useChains()
  const watchedSafes = useAppSelector(selectAllAddedSafes)
  const chains = useMemo(() => sortChainsByCurrentChain(configs, currentChainId), [configs, currentChainId])

  let allAddedSafes: SafeListItemDetails[] = []
  for (const chain of chains) {
    const addedSafesOnChain = watchedSafes[chain.chainId] ?? {}
    const addedSafesAdressesOnChain = Object.keys(addedSafesOnChain)
    const addedSafesWithChain = addedSafesAdressesOnChain.map((safeAddress) => ({safeAddress, chain}))
    allAddedSafes = [...allAddedSafes, ...addedSafesWithChain]
  }

  const [allAddedSafesWithBalances, error, loading] = useAsync<SafeListItemDetails[]>(() => {
    const promises = allAddedSafes.map(async ({safeAddress, chain}) => {
      const fiatBalance = await getBalances(chain.chainId, safeAddress, 'USD').then((result) => result.fiatTotal)
      return {
        safeAddress,
        chain,
        fiatBalance
      }
    })
    return Promise.all(promises);
  },[watchedSafes, configs], false)
  return [allAddedSafesWithBalances ?? [], error, loading]
}