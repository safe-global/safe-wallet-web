import type { Delay } from '@gnosis.pm/zodiac'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { getDelayModifiers } from '@/services/recovery/delay-modifier'
import { FEATURES } from '@/utils/chains'
import useAsync from '@/hooks/useAsync'
import { useHasFeature } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import type { AsyncResult } from '@/hooks/useAsync'

function isOnlySpendingLimitEnabled(chainId: string, modules: SafeInfo['modules']) {
  return modules?.length === 1 && modules[0].value === getSpendingLimitModuleAddress(chainId)
}

export function useDelayModifiers(): AsyncResult<Delay[]> {
  const supportsRecovery = useHasFeature(FEATURES.RECOVERY)
  const web3ReadOnly = useWeb3ReadOnly()
  const { safe, safeAddress } = useSafeInfo()

  return useAsync<Array<Delay>>(
    () => {
      // Don't fetch if only spending limit module is enabled
      if (
        supportsRecovery &&
        web3ReadOnly &&
        safe.modules &&
        safe.modules.length > 0 &&
        !isOnlySpendingLimitEnabled(safe.chainId, safe.modules)
      ) {
        // TODO: Don't fetch _every_ Delay Modifier, but only those which _don't_ have Zodiac
        // contracts as guardians. Zodiac only use the Delay Modifier with their contracts enabled
        return getDelayModifiers(safe.chainId, safe.modules, web3ReadOnly)
      }
    },
    // Need to check length of modules array to prevent new request every time Safe info polls
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeAddress, safe.chainId, safe.modules?.length, web3ReadOnly, supportsRecovery],
    false,
  )
}
