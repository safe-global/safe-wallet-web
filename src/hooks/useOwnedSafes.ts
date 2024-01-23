import { useEffect, useMemo, useState } from 'react'
import { ChainInfo, getOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'

import useWallet from '@/hooks/wallets/useWallet'
import useChainId from '@/hooks/useChainId'
import useChains, { useCurrentChain } from '@/hooks/useChains'

const getWalletSafes = async (walletAddress?: string, chainId?: string) => {
  if (!walletAddress || !chainId) return
  return getOwnedSafes(chainId, walletAddress)
}

type OwnedSafe = {
  chain: ChainInfo
  safeAddress: string
}

/**
 * Fetch all safes owned by the current wallet up to a certain limit.
 * The hook loads safes sequentially from all chains, updating its state as it goes.
 */
const useAllOwnedSafes = (safesToFetch: number, startChainId?: string): [OwnedSafe[], Error | undefined, boolean] => {
  const { address: walletAddress } = useWallet() || {}
  const currentChainId = useChainId()
  // const currentChain = useCurrentChain()

  const { configs } = useChains()

  const chains: ChainInfo[] = useMemo(() => {
    const currentChain = configs.find(({ chainId }) => chainId === currentChainId);
    const otherChains= configs.filter(({ chainId }) => chainId !== currentChainId);
    return currentChain ? [currentChain, ...otherChains] : configs;

  }, [configs, currentChainId])

  const [allSafes, setAllSafes] = useState<OwnedSafe[]>([])
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState<boolean>(false)

  // Reset state when the wallet address changes
  useEffect(() => {
    setAllSafes([])
    setError(undefined)
    setLoading(false)
  }, [walletAddress])

  // Fetch safes sequentially from all chains
  useEffect(() => {
    let current = true
    const load = async (index: number) => {
      const chain = chains[index]
      if (!current || !chain) return

      let chainSafes
      try {
        chainSafes = await getWalletSafes(walletAddress, chain.chainId)
      } catch (error) {
        setError(error as Error)
      }

      if (!current) return

      const ownedSafesOnChain = (chainSafes?.safes || []).map((safeAddress) => ({
        safeAddress,
        chain,
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

export default useAllOwnedSafes
