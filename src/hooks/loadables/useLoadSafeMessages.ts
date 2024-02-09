import { useEffect } from 'react'
import { getSafeMessages } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeMessageListPage } from '@safe-global/safe-gateway-typescript-sdk'

import useAsync from '@/hooks/useAsync'
import { logError, Errors } from '@/services/exceptions'
import useSafeInfo from '@/hooks/useSafeInfo'
import type { AsyncResult } from '@/hooks/useAsync'

export const useLoadSafeMessages = (): AsyncResult<SafeMessageListPage> => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()

  const [data, error, loading] = useAsync<SafeMessageListPage>(
    () => {
      if (!safeLoaded) return
      if (!safe.deployed) return Promise.resolve({ results: [] })

      return getSafeMessages(safe.chainId, safeAddress)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeLoaded, safe.chainId, safeAddress, safe.messagesTag, safe.deployed],
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
