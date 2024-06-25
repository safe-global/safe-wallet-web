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
import { useState, useEffect, useMemo, type ComponentType } from 'react'
import { type AlertColor } from '@mui/material'
import { SecuritySeverity } from '@/services/security/modules/types'
import CloseIcon from '@/public/images/common/close.svg'
import InfoIcon from '@/public/images/notifications/info.svg'
import CheckIcon from '@/public/images/common/check.svg'
import type { EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'

export const REDEFINE_RETRY_TIMEOUT = 2_000
const RedefineModuleInstance = new RedefineModule()

const DEFAULT_ERROR_MESSAGE = 'Unavailable'

const CRITICAL_ERRORS: Record<number, string> = {
  [1001]: 'Simulation failed',
  [2000]: DEFAULT_ERROR_MESSAGE,
  [3000]: DEFAULT_ERROR_MESSAGE,
}

type SecurityWarningProps = {
  color: AlertColor
  icon: ComponentType
  label: string
  action?: string
}

const ACTION_REJECT = 'Reject this transaction'
const ACTION_REVIEW = 'Review before processing'

export const mapRedefineSeverity: Record<SecuritySeverity, SecurityWarningProps> = {
  [SecuritySeverity.CRITICAL]: {
    action: ACTION_REJECT,
    color: 'error',
    icon: CloseIcon,
    label: 'critical risk',
  },
  [SecuritySeverity.HIGH]: {
    action: ACTION_REJECT,
    color: 'error',
    icon: CloseIcon,
    label: 'high risk',
  },
  [SecuritySeverity.MEDIUM]: {
    action: ACTION_REVIEW,
    color: 'warning',
    icon: InfoIcon,
    label: 'medium risk',
  },
  [SecuritySeverity.LOW]: {
    action: ACTION_REVIEW,
    color: 'warning',
    icon: InfoIcon,
    label: 'small risk',
  },
  [SecuritySeverity.NONE]: {
    color: 'success',
    icon: CheckIcon,
    label: 'No issues found',
  },
}

export const useRedefine = (
  data: SafeTransaction | EIP712TypedData | undefined,
): AsyncResult<SecurityResponse<RedefineModuleResponse>> => {
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()
  const [retryCounter, setRetryCounter] = useState(0)
  const isFeatureEnabled = useHasFeature(FEATURES.RISK_MITIGATION)

  // Memoized JSON data to avoid unnecessary requests
  const jsonData = useMemo(() => {
    if (!data) return ''
    let adjustedData = data
    if ('data' in data) {
      // We need to set nonce to 0 to avoid repeated requests with an updated nonce
      adjustedData = { ...data, data: { ...data.data, nonce: 0 } }
    }
    return JSON.stringify(adjustedData)
  }, [data])

  const [redefinePayload, redefineErrors, redefineLoading] = useAsync<SecurityResponse<RedefineModuleResponse>>(
    () => {
      if (!isFeatureEnabled || !jsonData || !wallet?.address) {
        return
      }

      return RedefineModuleInstance.scanTransaction({
        chainId: Number(safe.chainId),
        data: JSON.parse(jsonData),
        safeAddress,
        walletAddress: wallet.address,
        threshold: safe.threshold,
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safe.chainId, safe.threshold, safeAddress, jsonData, wallet?.address, retryCounter, isFeatureEnabled],
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
