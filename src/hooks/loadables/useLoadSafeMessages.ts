import { useEffect } from 'react'
import { getSafeMessages } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeMessageListPage } from '@gnosis.pm/safe-react-gateway-sdk'

import useAsync from '@/hooks/useAsync'
import { logError, Errors } from '@/services/exceptions'
import useSafeInfo from '@/hooks/useSafeInfo'
import type { AsyncResult } from '@/hooks/useAsync'

export const useLoadMessages = (): AsyncResult<SafeMessageListPage> => {
  const { safe, safeAddress, safeLoaded, messagesTag } = useSafeInfo()

  const [data, error, loading] = useAsync<SafeMessageListPage>(() => {
    if (!safeLoaded) {
      return
    }
    return getSafeMessages(safe.chainId, safeAddress)
  }, [safeLoaded, safe.chainId, safeAddress, messagesTag])

  useEffect(() => {
    if (error) {
      logError(Errors._608, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadMessages
