import { useEffect } from 'react'
import { isEqual } from 'lodash'
import { Errors, logError } from '@/services/exceptions'
import useChainId from '@/hooks/useChainId'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import type { JsonRpcProvider } from '@ethersproject/providers'
import { getSpendingLimitContract, getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { FEATURES } from '@safe-global/safe-gateway-typescript-sdk'
import { sameAddress } from '@/utils/addresses'
import { type AllowanceModule } from '@/types/contracts'
import { getERC20TokenInfoOnChain } from '@/utils/tokens'

import { sameString } from '@safe-global/safe-core-sdk/dist/src/utils'
import { useAppSelector } from '@/store'
import { selectTokens } from '@/store/balancesSlice'
import useSafeInfo from './useSafeInfo'
import useAsync, { type AsyncResult } from './useAsync'
import { useHasFeature } from './useChains'

export type SpendingLimitState = {
  beneficiary: string
  token: {
    address: string
    symbol: string
    decimals: number
    logoUri?: string
  }
  amount: string
  nonce: string
  resetTimeMin: string
  lastResetMin: string
  spent: string
}

const DEFAULT_TOKEN_INFO = {
  decimals: 18,
  symbol: '',
}

const discardZeroAllowance = (spendingLimit: SpendingLimitState): boolean =>
  !(sameString(spendingLimit.amount, '0') && sameString(spendingLimit.resetTimeMin, '0'))

const getTokenInfoFromBalances = (tokenInfoFromBalances: TokenInfo[], address: string): TokenInfo | undefined =>
  tokenInfoFromBalances.find((token) => token.address === address)

export const getTokenAllowanceForDelegate = async (
  contract: AllowanceModule,
  safeAddress: string,
  delegate: string,
  token: string,
  tokenInfoFromBalances: TokenInfo[],
): Promise<SpendingLimitState> => {
  const tokenAllowance = await contract.getTokenAllowance(safeAddress, delegate, token)
  const [amount, spent, resetTimeMin, lastResetMin, nonce] = tokenAllowance
  return {
    beneficiary: delegate,
    token: getTokenInfoFromBalances(tokenInfoFromBalances, token) ||
      (await getERC20TokenInfoOnChain(token)) || { ...DEFAULT_TOKEN_INFO, address: token },
    amount: amount.toString(),
    spent: spent.toString(),
    resetTimeMin: resetTimeMin.toString(),
    lastResetMin: lastResetMin.toString(),
    nonce: nonce.toString(),
  }
}

export const getTokensForDelegate = async (
  contract: AllowanceModule,
  safeAddress: string,
  delegate: string,
  tokenInfoFromBalances: TokenInfo[],
) => {
  const tokens = await contract.getTokens(safeAddress, delegate)

  return Promise.all(
    tokens.map(async (token) =>
      getTokenAllowanceForDelegate(contract, safeAddress, delegate, token, tokenInfoFromBalances),
    ),
  )
}

export const getSpendingLimits = async (
  provider: JsonRpcProvider,
  safeAddress: string,
  chainId: string,
  delegates: string[],
  tokenInfoFromBalances: TokenInfo[],
): Promise<SpendingLimitState[] | undefined> => {
  const contract = getSpendingLimitContract(chainId, provider)

  const spendingLimits = await Promise.all(
    delegates.map(async (delegate) => getTokensForDelegate(contract, safeAddress, delegate, tokenInfoFromBalances)),
  )

  return spendingLimits.flat().filter(discardZeroAllowance)
}

export const useSpendingLimitDelegates = (isEnabled: boolean): AsyncResult<string[]> => {
  const provider = useWeb3ReadOnly()
  const { safe, safeAddress } = useSafeInfo()

  return useAsync(async () => {
    if (!isEnabled || !provider) return
    const contract = getSpendingLimitContract(safe.chainId, provider)
    if (!contract) return

    const data = await contract.getDelegates(safeAddress, 0, 100)
    return data.results
  }, [isEnabled, safeAddress, safe.chainId, provider])
}

export const useSafeHasSpendingLimits = (): boolean => {
  const { safe } = useSafeInfo()
  const isEnabled = useHasFeature(FEATURES.SPENDING_LIMIT)
  if (!safe || !safe.modules || !isEnabled) return false

  const moduleAddress = getSpendingLimitModuleAddress(safe.chainId)
  if (!moduleAddress) return false

  return safe.modules.some((module) => sameAddress(module.value, moduleAddress))
}

export const useAllSpendingLimits = (): AsyncResult<SpendingLimitState[]> => {
  const { safeAddress } = useSafeInfo()
  const chainId = useChainId()
  const provider = useWeb3ReadOnly()
  const tokenInfoFromBalances = useAppSelector(selectTokens, isEqual)

  const [delegates, delegatesError, delegatesLoading] = useSpendingLimitDelegates(useSafeHasSpendingLimits())

  const [data, error, loading] = useAsync<SpendingLimitState[] | undefined>(
    () => {
      if (!delegates || !safeAddress || !provider || !tokenInfoFromBalances) return

      return getSpendingLimits(provider, safeAddress, chainId, delegates, tokenInfoFromBalances)
    },
    [provider, delegates, tokenInfoFromBalances, safeAddress, chainId],
    false,
  )

  const finalError = error || delegatesError
  useEffect(() => {
    if (finalError) {
      logError(Errors._609, finalError.message)
    }
  }, [finalError])

  return [data, finalError, loading || delegatesLoading]
}

export default useAllSpendingLimits
