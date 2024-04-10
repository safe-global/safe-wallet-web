import useTxQueue from '@/hooks/useTxQueue'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'

const useFirstNonce = () => {
  const { safe } = useSafeInfo()
  const queue = useTxQueue()

  if (queue.page) {
    for (let item of queue.page.results) {
      if (isTransactionListItem(item) && isMultisigExecutionInfo(item.transaction.executionInfo)) {
        return item.transaction.executionInfo.nonce
      }
    }
  }

  return safe.nonce
}

const QueueLabelText = () => {
  const firstNonce = useFirstNonce()
  return ` - transaction with nonce ${firstNonce} needs to be executed first`
}

export default QueueLabelText
