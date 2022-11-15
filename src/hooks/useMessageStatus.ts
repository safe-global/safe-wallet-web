import { MessageStatus } from './useMessages'
import type { Message } from './useMessages'

// TODO: Extend with pending status

const STATUS_LABELS = {
  [MessageStatus.CONFIRMED]: 'Confirmed',
  [MessageStatus.NEEDS_CONFIRMATION]: 'Needs confirmation',
}

const useMessageStatus = (item: Message) => {
  return STATUS_LABELS[item.status]
}

export default useMessageStatus
