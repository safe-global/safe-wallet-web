import { POLLING_INTERVAL } from '@/config/constants'
import { getCounterfactualBalance } from '@/features/counterfactual/utils'
import { useWeb3 } from '@/hooks/wallets/web3'
import { Errors, logError } from '@/services/exceptions'
import { useAppSelector } from '@/store'
import { TOKEN_LISTS, selectCurrency, selectSettings } from '@/store/settingsSlice'
import { FEATURES, hasFeature } from '@/utils/chains'
import { getBalances, type SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { useEffect, useMemo } from 'react'
import useAsync, { type AsyncResult } from '../useAsync'
import { useCurrentChain } from '../useChains'
import useClient from '../useClient'
import useIntervalCounter from '../useIntervalCounter'
import useSafeInfo from '../useSafeInfo'

const useTokenListSetting = (): boolean | undefined => {
  const chain = useCurrentChain()
  const settings = useAppSelector(selectSettings)

  const isTrustedTokenList = useMemo(() => {
    if (settings.tokenList === TOKEN_LISTS.ALL) return false
    return chain ? hasFeature(chain, FEATURES.DEFAULT_TOKENLIST) : undefined
  }, [chain, settings.tokenList])

  return isTrustedTokenList
}

export const useLoadBalances = (): AsyncResult<SafeBalanceResponse> => {
  const [pollCount, resetPolling] = useIntervalCounter(POLLING_INTERVAL)
  const currency = useAppSelector(selectCurrency)
  const isTrustedTokenList = useTokenListSetting()
  const { safe, safeAddress } = useSafeInfo()
  const web3 = useWeb3()
  const chain = useCurrentChain()
  const chainId = safe.chainId

  const publicClient = useClient((state) => state.publicClient)

  // Re-fetch assets when the entire SafeInfo updates
  const [data, error, loading] = useAsync<SafeBalanceResponse | undefined>(
    () => {
      if (!chainId || !safeAddress || isTrustedTokenList === undefined) return

      if (!safe.deployed) {
        return getCounterfactualBalance(safeAddress, publicClient, chain)
      }

      return getBalances(chainId, safeAddress, currency, {
        trusted: isTrustedTokenList,
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeAddress, chainId, currency, isTrustedTokenList, pollCount, safe.deployed, web3, chain],
    false, // don't clear data between polls
  )

  // Reset the counter when safe address/chainId changes
  useEffect(() => {
    resetPolling()
  }, [resetPolling, safeAddress, chainId])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._601, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadBalances
