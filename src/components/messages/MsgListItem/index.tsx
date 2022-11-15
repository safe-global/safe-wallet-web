import type { ReactElement } from 'react'

import { isMessageListDateLabel } from '@/utils/message-guards'
import TxDateLabel from '@/components/transactions/TxDateLabel'
import ExpandableTransactionItem from '@/components/messages/MsgListItem/ExpandableMsgItem'
import type { MessageListPage } from '@/hooks/useMessages'

const MsgListItem = ({ item }: { item: MessageListPage['results'][number] }): ReactElement => {
  if (isMessageListDateLabel(item)) {
    return <TxDateLabel item={item} />
  }
  return <ExpandableTransactionItem item={item} />
}

export default MsgListItem
