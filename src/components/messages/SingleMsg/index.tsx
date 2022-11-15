import { CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'

import useMessages from '@/hooks/useMessages'
import type { Message } from '@/hooks/useMessages'
import { isMessageListItem } from '@/utils/message-guards'
import ExpandableMsgItem from '@/components/messages/MsgListItem/ExpandableMsgItem'
import { TxListGrid } from '@/components/transactions/TxList'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'

const SingleMsgGrid = ({ item }: { item: Message }): ReactElement => {
  return (
    <TxListGrid>
      <ExpandableMsgItem item={item} />
    </TxListGrid>
  )
}

const SingleMsg = () => {
  const router = useRouter()
  const { id } = router.query
  const messageHash = Array.isArray(id) ? id[0] : id
  const { safe, safeAddress } = useSafeInfo()

  // TODO: Replace with call to gateway for specific message
  const { page } = useMessages()

  const [msgDetails, msgDetailsError] = useAsync(
    () => {
      if (!messageHash || !safeAddress) return

      return Promise.resolve(page.results.filter(isMessageListItem).find((item) => item.messageHash === messageHash))
    },
    [messageHash, safe.chainId, safeAddress],
    false,
  )

  if (msgDetailsError) {
    return <ErrorMessage error={msgDetailsError}>Failed to load message</ErrorMessage>
  }

  if (msgDetails) {
    return <SingleMsgGrid item={msgDetails} />
  }

  return <CircularProgress />
}

export default SingleMsg
