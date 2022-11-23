import type { ReactElement } from 'react'

import { isSafeMessageListDateLabel, isSafeMessageListItem } from '@/utils/safe-message-guards'
import TxDateLabel from '@/components/transactions/TxDateLabel'
import ExpandableMsgItem from '@/components/safeMessages/MsgListItem/ExpandableMsgItem'
import type { SafeMessageListPage } from '@/store/safeMessagesSlice'

const MsgListItem = ({ item }: { item: SafeMessageListPage['results'][number] }): ReactElement | null => {
  if (isSafeMessageListDateLabel(item)) {
    return <TxDateLabel item={item} />
  }
  if (isSafeMessageListItem(item)) {
    return <ExpandableMsgItem msg={item} />
  }
  return null
}

export default MsgListItem
