import type { ReactElement } from 'react'

import { isMessageListDateLabel, isMessageListItem } from '@/utils/message-guards'
import TxDateLabel from '@/components/transactions/TxDateLabel'
import ExpandableMsgItem from '@/components/messages/MsgListItem/ExpandableMsgItem'
import type { MessageListPage } from '@/hooks/useMessages'

const MsgListItem = ({ item }: { item: MessageListPage['results'][number] }): ReactElement | null => {
  if (isMessageListDateLabel(item)) {
    return <TxDateLabel item={item} />
  }
  if (isMessageListItem(item)) {
    return <ExpandableMsgItem item={item} />
  }
  return null
}

export default MsgListItem
