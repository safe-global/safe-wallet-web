import { useEffect, useMemo, useState } from 'react'
import { ChainInfo, getOwnedSafes, getBalances, type SafeBalanceResponse  } from '@safe-global/safe-gateway-typescript-sdk'

import useWallet from '@/hooks/wallets/useWallet'
import useChainId from '@/hooks/useChainId'
import useChains from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'

const getWalletSafes = async (walletAddress?: string, chainId?: string) => {
  if (!walletAddress || !chainId) return
  return getOwnedSafes(chainId, walletAddress)
}

type SafeListItemDetails = {
  chain: ChainInfo
  safeAddress: string
  fiatBalance: string
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
const useAllOwnedSafes = (safesToFetch: number, startChainId?: string): [SafeListItemDetails[], Error | undefined, boolean] => {
  const { address: walletAddress } = useWallet() || {}
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
  }, [walletAddress, currentChainId])

  // Fetch safes sequentially from all chains
  useEffect(() => {
    let current = true
    const load = async (index: number) => {
      const chain = chains[index]
      if (!current) return

      let chainSafes
      try {
        chainSafes = await getWalletSafes(walletAddress, chain.chainId)
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
  }, [walletAddress, chains, startChainId])

  return [allSafes, error, loading]
}


export const useAllWatchedSafes = (safesToFetch: number, startChainId?: string): [SafeListItemDetails[], Error | undefined, boolean] => {
  const { address: walletAddress } = useWallet() || {}
  const currentChainId = useChainId()
  const { configs } = useChains()
  const addedSafes = useAppSelector(selectAllAddedSafes)

  const chains = useMemo(() => sortChainsByCurrentChain(configs, currentChainId), [configs, currentChainId])

  const [allSafes, setAllSafes] = useState<SafeListItemDetails[]>([])
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState<boolean>(false)

  // Reset state when the wallet address or current chain changes
  useEffect(() => {
    setAllSafes([])
    setError(undefined)
    setLoading(false)
  }, [walletAddress, currentChainId])

  // Fetch safes sequentially from all chains
  useEffect(() => {
    let current = true
    const load = async (index: number) => {
      const chain = chains[index]
      if (!current) return

      const watchedChainSafes = Object.entries(addedSafes[chain.chainId] ?? {})

      const ownedSafesOnChain = await Promise.all(
        (watchedChainSafes || []).map(async ([safeAddress]) => {
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
  }, [walletAddress, chains, startChainId])

  return [allSafes, error, loading]
}




// export const useAllAddedSafes = async (): Promise<SafeListItemDetails[]> => {
//   const currentChainId = useChainId()
//   const { configs } = useChains()
//   const addedSafes = useAppSelector(selectAllAddedSafes)
//   const chains = useMemo(() => sortChainsByCurrentChain(configs, currentChainId), [configs, currentChainId])

//   let allAddedSafes: SafeListItemDetails[] = []
//   for (const chain of chains) {
//     const addedSafesOnChain = addedSafes[chain.chainId] ?? {}
//     const addedSafesAdressesOnChain = Object.entries(addedSafesOnChain)

//     const addedSafesDetailsOnChain = await Promise.all(
//       addedSafesAdressesOnChain.map(async ([safeAddress]) => {
//       const {fiatTotal: fiatBalance} =  await getBalances(chain.chainId, safeAddress, 'USD')
//       return  { safeAddress, chain, fiatBalance }
//     }))
//     allAddedSafes = [...allAddedSafes, ...addedSafesDetailsOnChain]
//   }
//   return allAddedSafes;
// }

export default useAllOwnedSafes
