import { type ReactElement } from 'react'
import { Label, LabelValue } from '@gnosis.pm/safe-react-gateway-sdk'
import css from './styles.module.css'
import useTxQueue from '@/hooks/useTxQueue'
import { isLabelListItem, isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import useSafeInfo from '@/hooks/useSafeInfo'

export const useGroupLabel = (item: Label): string => {
  const { page } = useTxQueue()
  const { safe } = useSafeInfo()

  const { label } = item

  if (label !== LabelValue.Queued || !page) {
    return label
  }

  const firstTx = page.results.find(isTransactionListItem)

  if (!firstTx || !isMultisigExecutionInfo(firstTx.transaction.executionInfo)) {
    return label
  }

  const getQueueLabel = (nonce: number) => {
    return `${label} - transaction with nonce ${nonce} needs to be executed first`
  }

  // There is also a 'Next' label on the page of the queue
  if (page.results.some((tx) => isLabelListItem(tx) && tx !== item)) {
    return getQueueLabel(firstTx.transaction.executionInfo.nonce)
  }

  // First transaction has an out of order nonce
  if (firstTx.transaction.executionInfo.nonce !== safe.nonce) {
    return getQueueLabel(safe.nonce)
  }

  return label
}

const GroupLabel = ({ item }: { item: Label }): ReactElement => {
  const label = useGroupLabel(item)

  return <div className={css.container}>{label}</div>
}

export default GroupLabel
