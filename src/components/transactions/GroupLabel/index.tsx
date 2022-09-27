import { type ReactElement } from 'react'
import { Label, LabelValue } from '@gnosis.pm/safe-react-gateway-sdk'
import css from './styles.module.css'
import useTxQueue from '@/hooks/useTxQueue'
import { isLabelListItem, isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'

const GroupLabel = ({ item }: { item: Label }): ReactElement => {
  let label: string | LabelValue = item.label

  const { page } = useTxQueue()

  // 'Queued' is returned when there is one tx in queue OR after the 'Next' tx when there is > 1 tx in queue
  // We're dealing with 'Queued' txs that can be executed only after 'Next' txs
  if (label === LabelValue.Queued) {
    const hasNext = page?.results.some((tx) => isLabelListItem(tx) && tx !== item)

    if (hasNext) {
      const firstTx = page?.results.find(isTransactionListItem)

      if (firstTx && isMultisigExecutionInfo(firstTx.transaction.executionInfo)) {
        label = `${label} - transaction with nonce ${firstTx.transaction.executionInfo.nonce} needs to be executed first`
      }
    }
  }

  return <div className={css.container}>{label}</div>
}

export default GroupLabel
