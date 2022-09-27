import { type ReactElement } from 'react'
import { Label, LabelValue } from '@gnosis.pm/safe-react-gateway-sdk'
import css from './styles.module.css'
import useTxQueue from '@/hooks/useTxQueue'
import { isLabelListItem, isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'

const GroupLabel = ({ item }: { item: Label }): ReactElement => {
  let label: string | LabelValue = item.label

  const { page } = useTxQueue()

  const labels = page?.results.filter(isLabelListItem)

  // First page has both 'Queued' and 'Next' labels
  const hasBothLabels = labels && labels.length > 1

  if (hasBothLabels && label === LabelValue.Queued) {
    const firstTx = page?.results.find(isTransactionListItem)

    if (firstTx && isMultisigExecutionInfo(firstTx.transaction.executionInfo)) {
      label = `${label} - transaction with nonce ${firstTx.transaction.executionInfo.nonce} needs to be executed first`
    }
  }

  return <div className={css.container}>{label}</div>
}

export default GroupLabel
