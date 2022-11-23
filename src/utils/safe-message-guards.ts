import { SafeMessageListItemType } from '@/store/safeMessagesSlice'
import type { SafeMessage, SafeMessageListPage, SafeMessageDateLabel } from '@/store/safeMessagesSlice'

export const isSafeMessageListDateLabel = (
  item: SafeMessageListPage['results'][number],
): item is SafeMessageDateLabel => {
  return item.type === SafeMessageListItemType.DATE_LABEL
}

export const isSafeMessageListItem = (item: SafeMessageListPage['results'][number]): item is SafeMessage => {
  return item.type === SafeMessageListItemType.MESSAGE
}
