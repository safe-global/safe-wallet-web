import { useEffect } from 'react'
import { getOwnedSafes, type OwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'

import useLocalStorage from '@/services/local-storage/useLocalStorage'
import useWallet from '@/hooks/wallets/useWallet'
import useAsync from './useAsync'
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

  const [_, error] = useAsync<void>(async () => {
    if (!chainId || !walletAddress) return

    const ownedSafes = await getOwnedSafes(chainId, walletAddress)

    setOwnedSafesCache((prev) => ({
      ...prev,
      [walletAddress]: {
        ...(prev?.[walletAddress] || {}),
        [chainId]: ownedSafes.safes,
      },
    }))
  }, [chainId, walletAddress, setOwnedSafesCache])

  useEffect(() => {
    if (error) {
      logError(Errors._610, error.message)
    }
  }, [error])

  return ownedSafesCache?.[walletAddress || ''] ?? {}
}

export default useOwnedSafes
