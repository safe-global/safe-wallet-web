import { useEffect } from 'react'
import { getOwnedSafes, type OwnedSafes } from '@gnosis.pm/safe-react-gateway-sdk'

import useChainId from '@/hooks/useChainId'
import useLocalStorage from '@/services/localStorage/useLocalStorage'
import useWallet from '@/hooks/wallets/useWallet'
import useAsync from './useAsync'

const CACHE_KEY = 'ownedSafes'

type OwnedSafesCache = {
  [walletAddress: string]: {
    [chainId: string]: OwnedSafes['safes']
  }
}

const useOwnedSafes = (): OwnedSafesCache['walletAddress'] => {
  const chainId = useChainId()
  const { address: walletAddress } = useWallet() || {}
  const [ownedSafesCache, setOwnedSafesCache] = useLocalStorage<OwnedSafesCache>(CACHE_KEY, {})

  const [ownedSafes] = useAsync<OwnedSafes['safes'] | undefined>(async () => {
    if (!chainId || !walletAddress) return

    return (await getOwnedSafes(chainId, walletAddress)).safes
  }, [chainId, walletAddress])

  useEffect(() => {
    if (!ownedSafes || !walletAddress || !chainId) return

    setOwnedSafesCache((prev) => ({
      ...prev,
      [walletAddress]: {
        ...(prev[walletAddress] || {}),
        [chainId]: ownedSafes,
      },
    }))
  }, [ownedSafes, setOwnedSafesCache, walletAddress, chainId])

  return ownedSafesCache[walletAddress || ''] ?? {}
}

export default useOwnedSafes
