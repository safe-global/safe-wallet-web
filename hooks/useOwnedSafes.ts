import { useEffect } from 'react'
import { getOwnedSafes, type OwnedSafes } from '@gnosis.pm/safe-react-gateway-sdk'

import useChainId from '@/hooks/useChainId'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
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
  const wallet = useWallet()
  const walletAddress = wallet?.address

  const [ownedSafes] = useAsync<OwnedSafes | undefined>(async () => {
    return !chainId || !walletAddress ? undefined : getOwnedSafes(chainId, walletAddress)
  }, [chainId, walletAddress])

  const [ownedSafesCache, setOwnedSafesCache] = useLocalStorage<OwnedSafesCache>(CACHE_KEY, {})

  useEffect(() => {
    if (!ownedSafes?.safes || !walletAddress || !chainId) {
      return
    }

    setOwnedSafesCache((prev) => ({
      ...prev,
      [walletAddress]: {
        ...(prev[walletAddress] || {}),
        [chainId]: ownedSafes.safes,
      },
    }))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownedSafes])

  return walletAddress ? ownedSafesCache[walletAddress] ?? {} : {}
}

export default useOwnedSafes
