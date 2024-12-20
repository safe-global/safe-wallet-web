import { getSafeMessages } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeMessageListPage } from '@safe-global/safe-gateway-typescript-sdk'

import { useAppSelector } from '@/store'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import { selectSafeMessages } from '@/store/safeMessagesSlice'

const useSafeMessages = (
  pageUrl?: string,
): {
  page?: SafeMessageListPage
  error?: string
  loading: boolean
} => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()

  // If pageUrl is passed, load a new messages page from the API
  const [page, error, loading] = useAsync<SafeMessageListPage>(
    () => {
      if (!safeLoaded || !pageUrl) {
        return
      }
      return getSafeMessages(safe.chainId, safeAddress, pageUrl)
    },
    [safe.chainId, safeAddress, safeLoaded, pageUrl],
    false,
  )

  const messagesState = useAppSelector(selectSafeMessages)

  return pageUrl
    ? // New page
      {
        page,
        error: error?.message,
        loading,
      }
    : // Stored page
      {
        page: messagesState.data,
        error: messagesState.error,
        loading: messagesState.loading,
      }
}

export default useSafeMessages
