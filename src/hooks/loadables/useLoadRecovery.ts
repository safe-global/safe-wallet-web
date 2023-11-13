import type { Delay } from '@gnosis.pm/zodiac'

import { getDelayModifiers } from '@/services/recovery/delay-modifier'
import { getRecoveryState } from '@/services/recovery/recovery-state'
import useAsync from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { useWeb3ReadOnly } from '../wallets/web3'
import { getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import useIntervalCounter from '../useIntervalCounter'
import { useHasFeature } from '../useChains'
import { FEATURES } from '@/utils/chains'
import type { AsyncResult } from '../useAsync'
import type { RecoveryState } from '@/store/recoverySlice'

const REFRESH_DELAY = 5 * 60 * 1_000 // 5 minutes

const useLoadRecovery = (): AsyncResult<RecoveryState> => {
  const { safe, safeAddress } = useSafeInfo()
  const web3ReadOnly = useWeb3ReadOnly()
  const [counter] = useIntervalCounter(REFRESH_DELAY)
  const supportsRecovery = useHasFeature(FEATURES.RECOVERY)

  const [delayModifiers, delayModifiersError, delayModifiersLoading] = useAsync<Array<Delay>>(() => {
    if (!supportsRecovery || !web3ReadOnly || !safe.modules || safe.modules.length === 0) {
      return
    }

    const isOnlySpendingLimit =
      safe.modules.length === 1 && safe.modules[0].value === getSpendingLimitModuleAddress(safe.chainId)

    if (isOnlySpendingLimit) {
      return
    }

    return getDelayModifiers(safe.chainId, safe.modules, web3ReadOnly)
    // Need to check length of modules array to prevent new request every time Safe info polls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeAddress, safe.chainId, safe.modules?.length, web3ReadOnly, supportsRecovery])

  const [recoveryState, recoveryStateError, recoveryStateLoading] = useAsync<RecoveryState>(() => {
    if (!delayModifiers || delayModifiers.length === 0) {
      return
    }

    return Promise.all(delayModifiers.map(getRecoveryState))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delayModifiers, counter])

  return [recoveryState, delayModifiersError || recoveryStateError, delayModifiersLoading || recoveryStateLoading]
}

export default useLoadRecovery
