import useAsync, { type AsyncResult } from '@/hooks/useAsync'
import { useHasFeature } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { MODALS_EVENTS, trackEvent } from '@/services/analytics'
import type { SecurityResponse } from '@/services/security/modules/types'
import { FEATURES } from '@/utils/chains'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { useEffect, useMemo } from 'react'

import type { EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'
import { BlockaidModule, type BlockaidModuleResponse } from '@/services/security/modules/BlockaidModule'

const BlockaidModuleInstance = new BlockaidModule()

const DEFAULT_ERROR_MESSAGE = 'Unavailable'

export const useBlockaid = (
  data: SafeTransaction | EIP712TypedData | undefined,
): AsyncResult<SecurityResponse<BlockaidModuleResponse>> => {
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()
  const isFeatureEnabled = useHasFeature(FEATURES.RISK_MITIGATION)

  const [blockaidPayload, blockaidErrors, blockaidLoading] = useAsync<SecurityResponse<BlockaidModuleResponse>>(
    () => {
      if (!isFeatureEnabled || !data || !wallet?.address) {
        return
      }

      return BlockaidModuleInstance.scanTransaction({
        chainId: Number(safe.chainId),
        data,
        safeAddress,
        walletAddress: wallet.address,
        threshold: safe.threshold,
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safe.chainId, safe.threshold, safeAddress, data, wallet?.address, isFeatureEnabled],
    false,
  )

  const loading = blockaidLoading

  useEffect(() => {
    if (!loading && blockaidPayload) {
      trackEvent({ ...MODALS_EVENTS.BLOCKAID_RESULT, label: blockaidPayload.severity })
    }
  }, [loading, blockaidPayload])

  const errorMsg = useMemo(
    () => (blockaidErrors ? new Error(DEFAULT_ERROR_MESSAGE) : blockaidPayload?.payload?.error),

    [blockaidErrors, blockaidPayload],
  )
  return [blockaidPayload, errorMsg, loading]
}
