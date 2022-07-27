import { useEffect } from 'react'
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

const isModuleEnabled = (modules: string[], moduleAddress: string): boolean => {
  return modules?.some((module) => sameAddress(module, moduleAddress)) ?? false
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
    delegates.results.map(async (delegate) => {
      const tokens = await contract.getTokens(safeAddress, delegate)
      return Promise.all(
        tokens.map(async (token) => {
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
        }),
      )
    }),
  )
  return spendingLimits.flat()
}

export const useLoadSpendingLimits = (): AsyncResult<SpendingLimitState[]> => {
  const { safeAddress, safe } = useSafeInfo()
  const chainId = useChainId()
  const provider = useWeb3ReadOnly()

  const [data, error, loading] = useAsync<SpendingLimitState[] | undefined>(
    async () => {
      if (!provider || !safe.modules) return

      return getSpendingLimits(provider, safe.modules, safeAddress, chainId)
    },
    [provider, safe.modules?.length, safeAddress, chainId],
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
