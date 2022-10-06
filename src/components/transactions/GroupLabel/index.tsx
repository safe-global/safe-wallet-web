import { type ReactElement } from 'react'
import type { Label } from '@gnosis.pm/safe-react-gateway-sdk'
import { LabelValue } from '@gnosis.pm/safe-react-gateway-sdk'
import css from './styles.module.css'
import useTxQueue from '@/hooks/useTxQueue'
import { isLabelListItem, isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import useSafeInfo from '@/hooks/useSafeInfo'

export const useFutureNonceLabel = () => {
  const { safe } = useSafeInfo()
  return `transaction with nonce ${safe.nonce} needs to be executed first`
}

export const useGroupLabel = (item: Label): string => {
  const { page } = useTxQueue()
  const { safe } = useSafeInfo()
  const futureNonceLabel = useFutureNonceLabel()

  const { label } = item

  if (label !== LabelValue.Queued || !page) {
    return label
  }

  const firstTx = page.results.find(isTransactionListItem)

  if (!firstTx || !isMultisigExecutionInfo(firstTx.transaction.executionInfo)) {
    return label
  }

  const hasNextLabel = page.results.some((tx) => isLabelListItem(tx) && tx !== item)
  const nonceInFuture = firstTx.transaction.executionInfo.nonce !== safe.nonce

  if (!hasNextLabel && !nonceInFuture) {
    return label
  }

  return `${label} - ${futureNonceLabel}`
}

export const GroupLabelTypography = ({ label }: { label: string }) => {
  return <div className={css.container}>{label}</div>
}

const GroupLabel = ({ item }: { item: Label }): ReactElement => {
  const label = useGroupLabel(item)

  return <GroupLabelTypography label={label} />
}

export default GroupLabel
