import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import {
  RedefineModule,
  type RedefineModuleResponse,
  REDEFINE_ERROR_CODES,
} from '@/services/security/modules/RedefineModule'
import type { SecurityResponse } from '@/services/security/modules/types'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { useState, useEffect } from 'react'

export const REDEFINE_RETRY_TIMEOUT = 2_000
const RedefineModuleInstance = new RedefineModule()

export const useRedefine = (safeTransaction: SafeTransaction | undefined) => {
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()
  const [retryCounter, setRetryCounter] = useState(0)

  const redefineResponse = useAsync<SecurityResponse<RedefineModuleResponse>>(
    () => {
      if (!safeTransaction || !wallet?.address) {
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

  const redefinePayload = redefineResponse[0]

  useEffect(() => {
    const isAnalyzing = redefinePayload?.payload?.errors.some(
      (error) => error.code === REDEFINE_ERROR_CODES.ANALYSIS_IN_PROGRESS,
    )
    if (!isAnalyzing) {
      return
    }

    let timeoutId = setTimeout(() => setRetryCounter((prev) => prev + 1), REDEFINE_RETRY_TIMEOUT)
    return () => clearTimeout(timeoutId)
  }, [redefinePayload])

  return redefineResponse
}
