import type { ReactElement } from 'react'

import { isMessageListDateLabel, isMessageListItem } from '@/utils/signed-message-guards'
import TxDateLabel from '@/components/transactions/TxDateLabel'
import ExpandableMsgItem from '@/components/signedMessages/MsgListItem/ExpandableMsgItem'
import type { SignedMessageListPage } from '@/store/signedMessagesSlice'

const MsgListItem = ({ item }: { item: SignedMessageListPage['results'][number] }): ReactElement | null => {
  if (isMessageListDateLabel(item)) {
    return <TxDateLabel item={item} />
  }
  if (isMessageListItem(item)) {
    return <ExpandableMsgItem msg={item} />
  }
  return null
}

export default MsgListItem
