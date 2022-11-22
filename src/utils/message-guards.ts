import { MessageListItemType } from '@/store/msgsSlice'
import type { Message, MessageListPage, MessageDateLabel } from '@/store/msgsSlice'

export const isMessageListDateLabel = (item: MessageListPage['results'][number]): item is MessageDateLabel => {
  return item.type === MessageListItemType.DATE_LABEL
}

export const isMessageListItem = (item: MessageListPage['results'][number]): item is Message => {
  return item.type === MessageListItemType.MESSAGE
}
