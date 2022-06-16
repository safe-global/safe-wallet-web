import { useEffect } from 'react'
import { getOwnedSafes, type OwnedSafes } from '@gnosis.pm/safe-react-gateway-sdk'

import useChainId from '@/services/useChainId'
import useLocalStorage from '@/services/localStorage/useLocalStorage'
import useWallet from '@/services/wallets/useWallet'

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

  const [ownedSafesCache = {}, setOwnedSafesCache] = useLocalStorage<OwnedSafesCache>(CACHE_KEY)

  useEffect(() => {
    if (!walletAddress) {
      return
    }

    let isCurrent = true

    const loadOwnedSafes = async () => {
      try {
        const { safes } = await getOwnedSafes(chainId, walletAddress)

        if (!isCurrent) {
          return
        }

        console.log(safes)

        setOwnedSafesCache((prev = {}) => ({
          ...prev,
          [walletAddress]: {
            ...(prev[walletAddress] || {}),
            [chainId]: safes,
          },
        }))
      } catch (err) {
        console.error('Error fetching owned Safes', err)
      }
    }

    loadOwnedSafes()

    return () => {
      isCurrent = false
    }
  }, [chainId, walletAddress, setOwnedSafesCache])

  return ownedSafesCache && walletAddress ? ownedSafesCache[walletAddress] ?? {} : {}
}

export default useOwnedSafes
