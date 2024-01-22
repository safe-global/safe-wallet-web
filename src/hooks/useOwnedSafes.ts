import { useEffect } from 'react'
import { getOwnedSafes, type OwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'

import useWallet from '@/hooks/wallets/useWallet'
import { Errors, logError } from '@/services/exceptions'
import useChainId from './useChainId'
import useAsync from '@/hooks/useAsync'
import useChains from '@/hooks/useChains'

const CACHE_KEY = 'ownedSafes'

type OwnedSafesCache = {
  [walletAddress: string]: {
    [chainId: string]: OwnedSafes['safes']
  }
}

const useOwnedSafes = (chainId: string) => {
  const { address: walletAddress } = useWallet() || {}

  return useAsync(() => {
    if (!walletAddress || !chainId) return

    return getOwnedSafes(chainId, walletAddress)
  }, [chainId, walletAddress])
}

const useAllOwnedSafes = (safesToFetch: number) => {

  const { configs } = useChains()
  const currentChainId = useChainId();

  const ownedSafesOnCurrentChain = useOwnedSafes(currentChainId);

}

export default useOwnedSafes
