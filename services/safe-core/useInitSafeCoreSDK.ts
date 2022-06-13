import { useEffect, useState } from 'react'
import { useCurrentChain } from '@/services/useChains'
import useWallet from '../wallets/useWallet'
import useSafeInfo from '../useSafeInfo'
import Safe from '@gnosis.pm/safe-core-sdk'
import createExternalStore from '@/services/createExternalStore'
import { initSafeSDK } from '@/services/safe-core/safeCoreSDK'

export const { getStore: getSafeSDK, setStore: setSafeSDK, useStore: useSafeSDK } = createExternalStore<Safe>()

export const useInitSafeCoreSDK = (): Error | null => {
  const chain = useCurrentChain()
  const wallet = useWallet()
  const { safe } = useSafeInfo()

  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!safe || !chain || !wallet || chain.chainId !== wallet.chainId) {
      return
    }

    initSafeSDK(wallet.provider, wallet.chainId, safe.address.value, safe.version).then(setSafeSDK).catch(setError)
  }, [chain, wallet, safe])

  return error
}
