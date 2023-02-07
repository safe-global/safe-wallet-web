import { useEffect, useMemo } from 'react'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import type { SpendingLimitState } from '@/store/spendingLimitsSlice'
import useChainId from '@/hooks/useChainId'
import { getWeb3, useWeb3ReadOnly } from '@/hooks/wallets/web3'
import type { JsonRpcProvider } from '@ethersproject/providers'
import { getSpendingLimitContract, getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import type { AddressEx } from '@safe-global/safe-gateway-typescript-sdk'
import { sameAddress } from '@/utils/addresses'
import { ERC20__factory } from '@/types/contracts'
import type { AllowanceModule } from '@/types/contracts'

import { sameString } from '@safe-global/safe-core-sdk/dist/src/utils'
import useBalances from '../useBalances'

type TokenInfoFromBalances = { [address: string]: { symbol: string; decimals: number; logoUri?: string } }

const isModuleEnabled = (modules: string[], moduleAddress: string): boolean => {
  return modules?.some((module) => sameAddress(module, moduleAddress)) ?? false
}

const discardZeroAllowance = (spendingLimit: SpendingLimitState): boolean =>
  !(sameString(spendingLimit.amount, '0') && sameString(spendingLimit.resetTimeMin, '0'))

const getTokenInfoFromBalances = (tokenInfoFromBalances: TokenInfoFromBalances, address: string) => {
  const tokenInfo = tokenInfoFromBalances[address]
  if (!tokenInfo) {
    return undefined
  }
  return {
    ...tokenInfo,
    address,
  }
}

const getTokenInfoOnChain = async (address: string) => {
  const web3 = getWeb3()
  if (!web3) {
    return undefined
  }

  const erc20 = ERC20__factory.connect(address, web3)
  return {
    address,
    symbol: await erc20.symbol(),
    decimals: await erc20.decimals(),
  }
}

export const getTokenAllowanceForDelegate = async (
  contract: AllowanceModule,
  safeAddress: string,
  delegate: string,
  token: string,
  tokenInfoFromBalances: TokenInfoFromBalances,
): Promise<SpendingLimitState> => {
  const tokenAllowance = await contract.getTokenAllowance(safeAddress, delegate, token)
  const [amount, spent, resetTimeMin, lastResetMin, nonce] = tokenAllowance
  return {
    beneficiary: delegate,
    token: getTokenInfoFromBalances(tokenInfoFromBalances, token) ||
      (await getTokenInfoOnChain(token)) || {
        address: token,
        decimals: 18,
        symbol: '',
      },
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
  tokenInfoFromBalances: TokenInfoFromBalances,
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
  safeModules: AddressEx[],
  safeAddress: string,
  chainId: string,
  tokenInfoFromBalances: TokenInfoFromBalances,
): Promise<SpendingLimitState[] | undefined> => {
  const spendingLimitModuleAddress = getSpendingLimitModuleAddress(chainId)
  if (!spendingLimitModuleAddress) return

  const isSpendingLimitEnabled = isModuleEnabled(
    safeModules.map((module) => module.value),
    spendingLimitModuleAddress,
  )
  if (!isSpendingLimitEnabled) return

  const contract = getSpendingLimitContract(chainId, provider)
  const delegates = await contract.getDelegates(safeAddress, 0, 100)

  const spendingLimits = await Promise.all(
    delegates.results.map(async (delegate) =>
      getTokensForDelegate(contract, safeAddress, delegate, tokenInfoFromBalances),
    ),
  )
  return spendingLimits.flat().filter(discardZeroAllowance)
}

export const useLoadSpendingLimits = (): AsyncResult<SpendingLimitState[]> => {
  const { safeAddress, safe, safeLoaded } = useSafeInfo()
  const chainId = useChainId()
  const provider = useWeb3ReadOnly()
  const { balances } = useBalances()

  const tokenInfoFromBalances = useMemo(() => {
    if (balances.items.length === 0) {
      return undefined
    }
    return balances.items.reduce((dictionary, item) => {
      dictionary[item.tokenInfo.address] = {
        symbol: item.tokenInfo.symbol,
        decimals: item.tokenInfo.decimals,
        logoUri: item.tokenInfo.logoUri,
      }
      return dictionary
    }, {} as TokenInfoFromBalances)
  }, [balances.items])

  const [data, error, loading] = useAsync<SpendingLimitState[] | undefined>(() => {
    if (!provider || !safeLoaded || !safe.modules || !tokenInfoFromBalances) return

    return getSpendingLimits(provider, safe.modules, safeAddress, chainId, tokenInfoFromBalances)
  }, [provider, safeLoaded, safe.modules?.length, safeAddress, chainId, safe.txHistoryTag, tokenInfoFromBalances])

  useEffect(() => {
    if (error) {
      logError(Errors._609, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadSpendingLimits
