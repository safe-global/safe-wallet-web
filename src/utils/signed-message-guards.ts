import { SignedMessageListItemType } from '@/store/signedMessagesSlice'
import type { SignedMessage, SignedMessageListPage, SignedMessageDateLabel } from '@/store/signedMessagesSlice'

export const isMessageListDateLabel = (
  item: SignedMessageListPage['results'][number],
): item is SignedMessageDateLabel => {
  return item.type === SignedMessageListItemType.DATE_LABEL
}

export const isMessageListItem = (item: SignedMessageListPage['results'][number]): item is SignedMessage => {
  return item.type === SignedMessageListItemType.MESSAGE
}
