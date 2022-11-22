import { useAppSelector } from '@/store'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import { selectMsgs } from '@/store/msgsSlice'
import type { MessageListPage } from '@/store/msgsSlice'

const useMessages = (
  pageUrl?: string,
): {
  page?: MessageListPage
  error?: string
  loading: boolean
} => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const messagesState = useAppSelector(selectMsgs)

  const [page, error, loading] = useAsync<MessageListPage>(
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
