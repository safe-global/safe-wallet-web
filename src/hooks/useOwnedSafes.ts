import { useEffect } from 'react'
import { getOwnedSafes, type OwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'

import useLocalStorage from '@/services/local-storage/useLocalStorage'
import useWallet from '@/hooks/wallets/useWallet'
import { Errors, logError } from '@/services/exceptions'
import useChainId from './useChainId'

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

export default useOwnedSafes
