import { useAppSelector } from '@/store'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import { selectSafeMessages } from '@/store/safeMessagesSlice'
import type { SafeMessageListPage } from '@/store/safeMessagesSlice'

const useMessages = (
  pageUrl?: string,
): {
  page?: SafeMessageListPage
  error?: string
  loading: boolean
} => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const messagesState = useAppSelector(selectSafeMessages)

  const [page, error, loading] = useAsync<SafeMessageListPage>(
    // TODO: Fetch page
    //@ts-ignore
    () => {
      if (!safeLoaded || !pageUrl) {
        return
      }
    },
    [safe.chainId, safeAddress, safeLoaded, pageUrl],
    false,
  )

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

export default useMessages
