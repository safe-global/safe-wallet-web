import { useEffect, useState } from 'react'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import { SpendingLimitState } from '@/store/spendingLimitsSlice'
import useChainId from '@/hooks/useChainId'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { JsonRpcProvider } from '@ethersproject/providers'
import { getSpendingLimitContract, getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import { AddressEx } from '@gnosis.pm/safe-react-gateway-sdk'
import { sameAddress } from '@/utils/addresses'
import { AllowanceModule } from '@/types/contracts'
import { sameString } from '@gnosis.pm/safe-core-sdk/dist/src/utils'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'

const isModuleEnabled = (modules: string[], moduleAddress: string): boolean => {
  return modules?.some((module) => sameAddress(module, moduleAddress)) ?? false
}

const discardZeroAllowance = (spendingLimit: SpendingLimitState): boolean =>
  !(sameString(spendingLimit.amount, '0') && sameString(spendingLimit.resetTimeMin, '0'))

export const getTokenAllowanceForDelegate = async (
  contract: AllowanceModule,
  safeAddress: string,
  delegate: string,
  token: string,
): Promise<SpendingLimitState> => {
  const tokenAllowance = await contract.getTokenAllowance(safeAddress, delegate, token)
  const [amount, spent, resetTimeMin, lastResetMin, nonce] = tokenAllowance

  return {
    beneficiary: delegate,
    token,
    amount: amount.toString(),
    spent: spent.toString(),
    resetTimeMin: resetTimeMin.toString(),
    lastResetMin: lastResetMin.toString(),
    nonce: nonce.toString(),
  }
}

export const getTokensForDelegate = async (contract: AllowanceModule, safeAddress: string, delegate: string) => {
  const tokens = await contract.getTokens(safeAddress, delegate)

  return Promise.all(tokens.map(async (token) => getTokenAllowanceForDelegate(contract, safeAddress, delegate, token)))
}

export const getSpendingLimits = async (
  provider: JsonRpcProvider,
  safeModules: AddressEx[],
  safeAddress: string,
  chainId: string,
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
    delegates.results.map(async (delegate) => getTokensForDelegate(contract, safeAddress, delegate)),
  )
  return spendingLimits.flat().filter(discardZeroAllowance)
}

export const useLoadSpendingLimits = (): AsyncResult<SpendingLimitState[]> => {
  const [updateSpendingLimitsTag, setUpdateSpendingLimitsTag] = useState<number>()
  const { safeAddress, safe } = useSafeInfo()
  const chainId = useChainId()
  const provider = useWeb3ReadOnly()

  // Update spending limits whenever a transaction is executed
  // TODO: Find a more optimised way to update them
  useEffect(() => {
    return txSubscribe(TxEvent.SUCCESS, () => setUpdateSpendingLimitsTag(Date.now()))
  }, [])

  const [data, error, loading] = useAsync<SpendingLimitState[] | undefined>(
    async () => {
      if (!provider || !safe.modules) return

      return getSpendingLimits(provider, safe.modules, safeAddress, chainId)
    },
    [provider, safe.modules?.length, safeAddress, chainId, updateSpendingLimitsTag],
    false,
  )

  useEffect(() => {
    if (error) {
      logError(Errors._609, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadSpendingLimits
