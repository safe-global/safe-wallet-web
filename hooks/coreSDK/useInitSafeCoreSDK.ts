import { useEffect, useState } from 'react'
import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '../wallets/useWallet'
import useSafeInfo from '@/hooks/useSafeInfo'
import { initSafeSDK, setSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'

export const useInitSafeCoreSDK = (): Error | null => {
  const chain = useCurrentChain()
  const wallet = useWallet()
  const { data: safe } = useSafeInfo()

  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!safe || !chain || !wallet || chain.chainId !== wallet.chainId) {
      return
    }

    initSafeSDK(wallet.provider, wallet.chainId, safe.address.value, safe.version).then(setSafeSDK).catch(setError)
  }, [chain, wallet, safe])

  return error
}
