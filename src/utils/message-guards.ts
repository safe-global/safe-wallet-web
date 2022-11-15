import { MessageListItemType } from '@/hooks/useMessages'
import type { Message } from '@/hooks/useMessages'
import type { MessageListPage, MessageDateLabel } from '@/hooks/useMessages'

export const isMessageListDateLabel = (item: MessageListPage['results'][number]): item is MessageDateLabel => {
  return item.type === MessageListItemType.DATE_LABEL
}

export const isMessageListItem = (item: MessageListPage['results'][number]): item is Message => {
  return item.type === MessageListItemType.MESSAGE
}
