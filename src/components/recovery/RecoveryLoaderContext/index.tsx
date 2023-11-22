import { createContext, useCallback, useEffect, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { Delay } from '@gnosis.pm/zodiac'

import { getDelayModifiers } from '@/services/recovery/delay-modifier'
import { getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import { FEATURES } from '@/utils/chains'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain, useHasFeature } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useIntervalCounter from '@/hooks/useIntervalCounter'
import { getRecoveryState } from '@/services/recovery/recovery-state'
import { recoverySlice } from '@/store/recoverySlice'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { sameAddress } from '@/utils/addresses'
import { useUpdateStore } from '@/hooks/useLoadableStores'
import type { AsyncResult } from '@/hooks/useAsync'
import type { RecoveryState } from '@/store/recoverySlice'

const REFRESH_DELAY = 5 * 60 * 1_000 // 5 minutes

export const RecoveryLoaderContext = createContext<{
  refetch: () => void
}>({
  refetch: () => {},
})

export function RecoveryLoaderProvider({ children }: { children: ReactNode }): ReactElement {
  const [delayModifiers, delayModifiersError, delayModifiersLoading] = _useDelayModifiers()
  const {
    data: [recoveryState, recoveryStateError, recoveryStateLoading],
    refetch,
  } = _useRecoveryState(delayModifiers)

  // Reload recovery data when a Delay Modifier is interacted with
  useEffect(() => {
    if (!delayModifiers) {
      return
    }

    return txSubscribe(TxEvent.PROCESSED, (detail) => {
      // TODO: Disabling Delay Modifier should also reload recovery data
      // after https://github.com/safe-global/safe-wallet-web/pull/2848 is merged

      // TODO: This won't pick up relayed transactions as we don't dispatch `to` with them
      // May require complex refactor of txEvents service as we don't have `to` readily available
      const isDelayModifierTx = delayModifiers.some((delayModifier) => sameAddress(delayModifier.address, detail.to))
      if (isDelayModifierTx) {
        refetch()
      }
    })
  }, [delayModifiers, refetch])

  // Update store with latest recovery data
  const useLoadHook = useCallback(
    (): AsyncResult<RecoveryState> => [
      recoveryState,
      delayModifiersError ?? recoveryStateError,
      delayModifiersLoading ?? recoveryStateLoading,
    ],
    [delayModifiersError, delayModifiersLoading, recoveryState, recoveryStateError, recoveryStateLoading],
  )

  useUpdateStore(recoverySlice, useLoadHook)

  return <RecoveryLoaderContext.Provider value={{ refetch }}>{children}</RecoveryLoaderContext.Provider>
}

export function _useDelayModifiers() {
  const supportsRecovery = useHasFeature(FEATURES.RECOVERY)
  const web3ReadOnly = useWeb3ReadOnly()
  const { safe, safeAddress } = useSafeInfo()

  return useAsync<Array<Delay>>(
    () => {
      if (!supportsRecovery || !web3ReadOnly || !safe.modules || safe.modules.length === 0) {
        return
      }

      // Don't fetch if only spending limit module is enabled
      const isOnlySpendingLimit =
        safe.modules.length === 1 && safe.modules[0].value === getSpendingLimitModuleAddress(safe.chainId)

      if (isOnlySpendingLimit) {
        return
      }

      // TODO: Don't fetch _every_ Delay Modifier, but only those which _don't_ have Zodiac
      // contracts as guardians. Zodiac only use the Delay Modifier with their contracts enabled
      return getDelayModifiers(safe.chainId, safe.modules, web3ReadOnly)
    },
    // Need to check length of modules array to prevent new request every time Safe info polls
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeAddress, safe.chainId, safe.modules?.length, web3ReadOnly, supportsRecovery],
    false,
  )
}

export function _useRecoveryState(delayModifiers?: Array<Delay>): {
  data: AsyncResult<RecoveryState>
  refetch: () => void
} {
  const web3ReadOnly = useWeb3ReadOnly()
  const chain = useCurrentChain()
  const { safe, safeAddress } = useSafeInfo()

  // Reload recovery data every REFRESH_DELAY
  const [counter] = useIntervalCounter(REFRESH_DELAY)

  // Reload recovery data when manually triggered
  const [refetchDep, setRefetchDep] = useState(false)
  const refetch = useCallback(() => {
    setRefetchDep((prev) => !prev)
  }, [])

  const data = useAsync<RecoveryState>(
    () => {
      if (!delayModifiers || delayModifiers.length === 0 || !chain?.transactionService || !web3ReadOnly) {
        return
      }

      return Promise.all(
        delayModifiers.map((delayModifier) =>
          getRecoveryState({
            delayModifier,
            transactionService: chain.transactionService,
            safeAddress,
            provider: web3ReadOnly,
            chainId: safe.chainId,
            version: safe.version,
          }),
        ),
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      delayModifiers,
      counter,
      refetchDep,
      chain?.transactionService,
      web3ReadOnly,
      safeAddress,
      safe.chainId,
      safe.version,
    ],
    false,
  )

  return { data, refetch }
}
