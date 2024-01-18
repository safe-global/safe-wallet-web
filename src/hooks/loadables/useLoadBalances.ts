import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import { useEffect, useMemo } from 'react'
import { getBalances, type SafeBalanceResponse, TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import useAsync, { type AsyncResult } from '../useAsync'
import { Errors, logError } from '@/services/exceptions'
import { selectCurrency, selectSettings, TOKEN_LISTS } from '@/store/settingsSlice'
import { useCurrentChain } from '../useChains'
import { FEATURES, hasFeature } from '@/utils/chains'
import { POLLING_INTERVAL } from '@/config/constants'
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
  const chainId = safe.chainId
  const chain = useCurrentChain()
  const web3ReadOnly = useWeb3ReadOnly()

  // Re-fetch assets when the entire SafeInfo updates
  const [data, error, loading] = useAsync<SafeBalanceResponse | undefined>(
    async () => {
      if (!chain || !chainId || !safeAddress || isTrustedTokenList === undefined) return

      if (!safe.deployed) {
        const balance = await web3ReadOnly?.getBalance(safeAddress)

        return Promise.resolve({
          fiatTotal: '0',
          items: [
            {
              tokenInfo: {
                type: TokenType.NATIVE_TOKEN,
                address: ZERO_ADDRESS,
                ...chain.nativeCurrency,
              },
              balance: balance?.toString(),
              fiatBalance: '0',
              fiatConversion: '0',
            },
          ],
        } as SafeBalanceResponse)
      }

      return getBalances(chainId, safeAddress, currency, {
        trusted: isTrustedTokenList,
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeAddress, chainId, currency, isTrustedTokenList, pollCount, web3ReadOnly],
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
