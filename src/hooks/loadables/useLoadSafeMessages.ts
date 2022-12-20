import { useEffect } from 'react'
import { getSafeMessages } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeMessageListPage } from '@safe-global/safe-gateway-typescript-sdk'

import useAsync from '@/hooks/useAsync'
import { logError, Errors } from '@/services/exceptions'
import useSafeInfo from '@/hooks/useSafeInfo'
import { POLLING_INTERVAL } from '@/config/constants'
import useIntervalCounter from '@/hooks/useIntervalCounter'
import type { AsyncResult } from '@/hooks/useAsync'

export const useLoadSafeMessages = (): AsyncResult<SafeMessageListPage> => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()

  // TODO: Remove manual polling when messagesTag is no longer cached on the backend
  const [pollCount, resetPolling] = useIntervalCounter(POLLING_INTERVAL)

  // Reset the counter when safe address/chainId changes
  useEffect(() => {
    resetPolling()
  }, [resetPolling, safeAddress, safe.chainId])

  const [data, error, loading] = useAsync<SafeMessageListPage>(
    () => {
      if (!safeLoaded) {
        return
      }
      return getSafeMessages(safe.chainId, safeAddress)
    },
    [
      safeLoaded,
      safe.chainId,
      safeAddress,
      // safe.messagesTag,
      pollCount,
    ],
    false,
  )

  useEffect(() => {
    if (error) {
      logError(Errors._608, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadSafeMessages
