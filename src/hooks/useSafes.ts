import { useEffect, useMemo, useState } from 'react'
import {
  ChainInfo,
  getOwnedSafes,
  getBalances,
  AddressEx,
  OwnedSafes,
} from '@safe-global/safe-gateway-typescript-sdk'

import useWallet from '@/hooks/wallets/useWallet'
import useChainId from '@/hooks/useChainId'
import useChains from '@/hooks/useChains'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import useAsync from './useAsync'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { Errors, logError } from '@/services/exceptions'

type SafeListItemDetails = {
  chain: ChainInfo
  safeAddress: string
  fiatBalance?: string
  threshold: number;
  owners: AddressEx[];
}

const sortChainsByCurrentChain = (chains: ChainInfo[], currentChainId: string): ChainInfo[] => {
  const currentChain = chains.find(({ chainId }) => chainId === currentChainId)
  const otherChains = chains.filter(({ chainId }) => chainId !== currentChainId)
  return currentChain ? [currentChain, ...otherChains] : chains
}


// const getWalletSafes = async (walletAddress?: string, chainId?: string) => {
//   if (!walletAddress || !chainId) return
//   return getOwnedSafes(chainId, walletAddress)
// }

/**
 * Fetch all safes owned by the current wallet up to a certain limit.
 * The hook loads safes sequentially from all chains, updating its state as it goes.
 */
// const useOwnedSafes = (
//   safesToFetch: number,
//   startChainId?: string,
// ): [SafeListItemDetails[], Error | undefined, boolean] => {
//   const wallet = useWallet()
//   const currentChainId = useChainId()
//   const { configs } = useChains()

//   const chains = useMemo(() => sortChainsByCurrentChain(configs, currentChainId), [configs, currentChainId])

//   const [allSafes, setAllSafes] = useState<SafeListItemDetails[]>([])
//   const [error, setError] = useState<Error>()
//   const [loading, setLoading] = useState<boolean>(false)

//   // Reset state when the wallet address or current chain changes
//   useEffect(() => {
//     setAllSafes([])
//     setError(undefined)
//     setLoading(false)
//   }, [wallet, currentChainId])

//   // Fetch safes sequentially from all chains
//   useEffect(() => {
//     let current = true
//     const load = async (index: number) => {
//       const chain = chains[index]
//       if (!current || !wallet) return

//       let chainSafes
//       try {
//         chainSafes = await getWalletSafes(wallet.address, chain.chainId)
//       } catch (error) {
//         setError(error as Error)
//       }

//       const ownedSafesOnChain = await Promise.all(
//         (chainSafes?.safes || []).map(async (safeAddress) => {
//           const { fiatTotal: fiatBalance } = await getBalances(chain.chainId, safeAddress, 'USD')
//           return { safeAddress, chain, fiatBalance }
//         }),
//       )

//       setAllSafes((prevSafes) => {
//         const newAllSafes = [...prevSafes, ...ownedSafesOnChain]
//         if (safesToFetch > newAllSafes.length && index < chains.length - 1) {
//           load(index + 1)
//         } else {
//           setLoading(false)
//         }
//         return newAllSafes
//       })
//     }

//     if (safesToFetch > 0) {
//       const startIndex = startChainId ? chains.findIndex((chain) => chain.chainId === startChainId) + 1 : 0
//       if (startIndex < chains.length) {
//         load(startIndex)
//         setLoading(true)
//       }
//     }

//     return () => {
//       current = false
//     }
//   }, [wallet, chains, startChainId])

//   return [allSafes, error, loading]
// }

const CACHE_KEY = 'ownedSafes'

type OwnedSafesCache = {
  [walletAddress: string]: {
    [chainId: string]: OwnedSafes['safes']
  }
}


const useOwnedSafes = (): OwnedSafesCache['walletAddress'] => {
  const chainId = useChainId()
  const { address: walletAddress } = useWallet() || {}
  const [ownedSafesCache, setOwnedSafesCache] = useLocalStorage<OwnedSafesCache>(CACHE_KEY)

  useEffect(() => {
    if (!walletAddress || !chainId) return
    let isCurrent = true

    /**
     * No useAsync in this case to avoid updating
     * for a new chainId with stale data see https://github.com/safe-global/safe-wallet-web/pull/1760#discussion_r1133705349
     */
    getOwnedSafes(chainId, walletAddress)
      .then(
        (ownedSafes) =>
          isCurrent &&
          setOwnedSafesCache((prev) => ({
            ...prev,
            [walletAddress]: {
              ...(prev?.[walletAddress] || {}),
              [chainId]: ownedSafes.safes,
            },
          })),
      )
      .catch((error: Error) => logError(Errors._610, error.message))

    return () => {
      isCurrent = false
    }
  }, [chainId, walletAddress, setOwnedSafesCache])

  return ownedSafesCache?.[walletAddress || ''] ?? {}
}


export const useWatchedSafes = (): [SafeListItemDetails[], Error | undefined, boolean] => {
  const currentChainId = useChainId()
  const { configs } = useChains()
  const watchedSafes = useAppSelector(selectAllAddedSafes)
  const chains = useMemo(() => sortChainsByCurrentChain(configs, currentChainId), [configs, currentChainId])

  let allAddedSafes: SafeListItemDetails[] = []
  for (const chain of chains) {
    const addedSafesOnChain = watchedSafes[chain.chainId] ?? {}
    const addedSafesAdressesOnChain = Object.keys(addedSafesOnChain)
    const addedSafesWithChain = addedSafesAdressesOnChain.map((safeAddress) => {
      const {threshold, owners} = addedSafesOnChain[safeAddress]
      return { safeAddress, chain, threshold, owners }
    })
    allAddedSafes = [...allAddedSafes, ...addedSafesWithChain]
  }

  const [allAddedSafesWithBalances, error, loading] = useAsync<SafeListItemDetails[]>(
    () => {
      const promises = allAddedSafes.map(async ({ safeAddress, chain, threshold, owners }) => {
        const fiatBalance = await getBalances(chain.chainId, safeAddress, 'USD').then((result) => result.fiatTotal)
        return {
          safeAddress,
          chain,
          fiatBalance,
          threshold,
          owners
        }
      })
      return Promise.all(promises)
    },
    [watchedSafes, configs],
    false,
  )
  return [allAddedSafesWithBalances ?? [], error, loading]
}

export default useOwnedSafes;
