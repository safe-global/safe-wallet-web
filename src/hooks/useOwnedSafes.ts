import { useEffect } from 'react'
import { getOwnedSafes, type OwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'

import useLocalStorage from '@/services/local-storage/useLocalStorage'
import useWallet from '@/hooks/wallets/useWallet'
import useAsync from './useAsync'
import { Errors, logError } from '@/services/exceptions'
import useSafeInfo from '@/hooks/useSafeInfo'

const CACHE_KEY = 'ownedSafes'

type OwnedSafesCache = {
  [walletAddress: string]: {
    [chainId: string]: OwnedSafes['safes']
  }
}

const useOwnedSafes = (): OwnedSafesCache['walletAddress'] => {
  const { safe } = useSafeInfo()
  const { address: walletAddress } = useWallet() || {}
  const [ownedSafesCache, setOwnedSafesCache] = useLocalStorage<OwnedSafesCache>(CACHE_KEY)

  const [ownedSafes, error] = useAsync<OwnedSafes>(() => {
    if (!safe.chainId || !walletAddress) return
    return getOwnedSafes(safe.chainId, walletAddress)
  }, [safe.chainId, walletAddress])

  useEffect(() => {
    if (!ownedSafes || !walletAddress || !safe.chainId) return

    setOwnedSafesCache((prev) => ({
      ...prev,
      [walletAddress]: {
        ...(prev?.[walletAddress] || {}),
        [safe.chainId]: ownedSafes.safes,
      },
    }))
  }, [ownedSafes, setOwnedSafesCache, walletAddress, safe.chainId])

  useEffect(() => {
    if (error) {
      logError(Errors._610, error.message)
    }
  }, [error])

  return ownedSafesCache?.[walletAddress || ''] ?? {}
}

export default useOwnedSafes
