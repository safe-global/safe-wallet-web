import { getSafeMessages } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeMessageListPage } from '@gnosis.pm/safe-react-gateway-sdk'

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

  // The latest page of the messages is always in the store
  const messagesState = useAppSelector(selectSafeMessages)

  // Return the new page or the stored page
  return pageUrl
    ? {
        page,
        error: error?.message,
        loading: loading,
      }
    : {
        page: messagesState.data,
        error: messagesState.error,
        loading: messagesState.loading,
      }
}

export default useSafeMessages
