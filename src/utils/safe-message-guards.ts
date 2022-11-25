import { SafeMessageListItemType } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeMessageListItem, SafeMessage, SafeMessageDateLabel } from '@gnosis.pm/safe-react-gateway-sdk'

export const isSafeMessageListDateLabel = (item: SafeMessageListItem): item is SafeMessageDateLabel => {
  return item.type === SafeMessageListItemType.DATE_LABEL
}

export const isSafeMessageListItem = (item: SafeMessageListItem): item is SafeMessage => {
  return item.type === SafeMessageListItemType.MESSAGE
}
