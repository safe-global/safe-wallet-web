import { type ReactElement } from 'react'
import type { Label } from '@gnosis.pm/safe-react-gateway-sdk'
import { LabelValue } from '@gnosis.pm/safe-react-gateway-sdk'
import css from './styles.module.css'
import useTxQueue from '@/hooks/useTxQueue'
import { isLabelListItem, isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import useSafeInfo from '@/hooks/useSafeInfo'

const useGroupLabel = (label: LabelValue): string => {
  const { page } = useTxQueue()
  const { safe } = useSafeInfo()

  if (label !== LabelValue.Queued || !page) {
    return label
  }

  const firstTx = page.results.find(isTransactionListItem)

  if (!firstTx || !isMultisigExecutionInfo(firstTx.transaction.executionInfo)) {
    return label
  }

  const hasNextLabel = page.results.some((item) => isLabelListItem(item) && item.label !== label)
  const nonceInFuture = firstTx.transaction.executionInfo.nonce !== safe.nonce

  if (!hasNextLabel && !nonceInFuture) {
    return label
  }

  return `${label} – transaction with nonce ${safe.nonce} needs to be executed first`
}

const GroupLabel = ({ item }: { item: Label }): ReactElement => {
  const label = useGroupLabel(item.label)

  return <div className={css.container}>{label}</div>
}

export default GroupLabel

export const _useGroupLabel = useGroupLabel
