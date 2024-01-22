import { useEffect, useMemo, useState } from 'react'
import { getOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'

import useWallet from '@/hooks/wallets/useWallet'
import useChainId from '@/hooks/useChainId'
import useChains from '@/hooks/useChains'

const getWalletSafes = async (walletAddress?: string, chainId?: string) => {
  if (!walletAddress || !chainId) return
  return getOwnedSafes(chainId, walletAddress)
}

type OwnedSafe = {
  chainId: string
  safeAddress: string
}

/**
 * Fetch all safes owned by the current wallet up to a certain limit.
 * The hook loads safes sequentially from all chains, updating its state as it goes.
 */
const useAllOwnedSafes = (safesToFetch: number): [OwnedSafe[], Error | undefined, boolean] => {
  const { address: walletAddress } = useWallet() || {}
  const currentChainId = useChainId()
  const { configs } = useChains()

  const chainIds = useMemo(() => {
    const allChainIds = configs.map((config) => config.chainId).filter((chainId) => chainId !== currentChainId)
    return [currentChainId, ...allChainIds]
  }, [configs, currentChainId])

  const [allSafes, setAllSafes] = useState<OwnedSafe[]>([])
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let current = true
    const allSafes: OwnedSafe[] = []

    const load = async (index: number) => {
      if (!current) return

      const chainId = chainIds[index]
      let chainSafes
      try {
        chainSafes = await getWalletSafes(walletAddress, chainId)
      } catch (error) {
        setError(error as Error)
      }

      if (!current) return

      const ownedSafesOnChain = (chainSafes?.safes || []).map((safeAddress) => ({
        safeAddress,
        chainId,
      }))

      const newAllSafes = [...allSafes, ...ownedSafesOnChain]

      setAllSafes(newAllSafes)

      if (safesToFetch > newAllSafes.length && index < chainIds.length - 1) {
        load(index + 1)
      } else {
        setLoading(false)
      }
    }

    if (safesToFetch > 0) {
      setLoading(true)
      load(0)
    }

    return () => {
      current = false
    }
  }, [walletAddress, chainIds])

  return [allSafes, error, loading]
}

export default useAllOwnedSafes
