import useAsync, { type AsyncResult } from '@/hooks/useAsync'
import { useHasFeature } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { MODALS_EVENTS, trackEvent } from '@/services/analytics'
import {
  RedefineModule,
  type RedefineModuleResponse,
  REDEFINE_ERROR_CODES,
} from '@/services/security/modules/RedefineModule'
import type { SecurityResponse } from '@/services/security/modules/types'
import { FEATURES } from '@/utils/chains'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { useState, useEffect, useMemo } from 'react'

export const REDEFINE_RETRY_TIMEOUT = 2_000
const RedefineModuleInstance = new RedefineModule()

const DEFAULT_ERROR_MESSAGE = 'Unavailable'

const CRITICAL_ERRORS: Record<number, string> = {
  [1001]: 'Simulation failed',
  [2000]: DEFAULT_ERROR_MESSAGE,
  [3000]: DEFAULT_ERROR_MESSAGE,
}

export const useRedefine = (
  safeTransaction: SafeTransaction | undefined,
): AsyncResult<SecurityResponse<RedefineModuleResponse>> => {
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()
  const [retryCounter, setRetryCounter] = useState(0)
  const isFeatureEnabled = useHasFeature(FEATURES.RISK_MITIGATION)

  const [redefinePayload, redefineErrors, redefineLoading] = useAsync<SecurityResponse<RedefineModuleResponse>>(
    () => {
      if (!isFeatureEnabled || !safeTransaction || !wallet?.address) {
        return
      }

      return RedefineModuleInstance.scanTransaction({
        chainId: Number(safe.chainId),
        safeTransaction,
        safeAddress,
        walletAddress: wallet.address,
        threshold: safe.threshold,
      })
    },
    [safe.chainId, safe.threshold, safeAddress, safeTransaction, wallet?.address, retryCounter],
    false,
  )

  const isAnalyzing = !!redefinePayload?.payload?.errors.some(
    (error) => error.code === REDEFINE_ERROR_CODES.ANALYSIS_IN_PROGRESS,
  )

  const loading = redefineLoading || isAnalyzing

  const error = useMemo(() => {
    const simulationErrors =
      redefinePayload?.payload?.errors.filter((error) => CRITICAL_ERRORS[error.code] !== undefined) ?? []
    const errorMessage = redefineErrors
      ? DEFAULT_ERROR_MESSAGE
      : simulationErrors.length > 0
      ? CRITICAL_ERRORS[simulationErrors[0].code]
      : undefined
    return errorMessage ? new Error(errorMessage) : undefined
  }, [redefineErrors, redefinePayload?.payload?.errors])

  useEffect(() => {
    if (!isAnalyzing) {
      return
    }

    let timeoutId = setTimeout(() => setRetryCounter((prev) => prev + 1), REDEFINE_RETRY_TIMEOUT)
    return () => clearTimeout(timeoutId)
  }, [redefinePayload, isAnalyzing])

  useEffect(() => {
    if (!loading && !error && redefinePayload) {
      trackEvent({ ...MODALS_EVENTS.REDEFINE_RESULT, label: redefinePayload.severity })
    }
  }, [error, loading, redefinePayload])

  return [redefinePayload, error, loading]
}
