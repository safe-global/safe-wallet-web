import { useAppSelector } from '@/store'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import { selectSignedMessages } from '@/store/signedMessagesSlice'
import type { SignedMessageListPage } from '@/store/signedMessagesSlice'

const useMessages = (
  pageUrl?: string,
): {
  page?: SignedMessageListPage
  error?: string
  loading: boolean
} => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const messagesState = useAppSelector(selectSignedMessages)

  const [page, error, loading] = useAsync<SignedMessageListPage>(
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
