import { type ReactElement } from 'react'
import { Label, LabelValue } from '@gnosis.pm/safe-react-gateway-sdk'
import css from './styles.module.css'
import useTxQueue from '@/hooks/useTxQueue'
import { isLabelListItem, isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import useSafeInfo from '@/hooks/useSafeInfo'

const GroupLabel = ({ item }: { item: Label }): ReactElement => {
  let label: string | LabelValue = item.label

  const { page } = useTxQueue()
  const { safe } = useSafeInfo()

  /**
   * 'Next' label is returned when the first transaction has a correct nonce
   * 'Queued' label is returned after 'Next' OR when the first transaction has an out of order nonce
   *
   * We want to append to the 'Queue' label if:
   * - There is a 'Next' label on the first page
   * - The first transaction has an out of order nonce
   */

  if (label === LabelValue.Queued && page) {
    const hasNext = page.results.some((tx) => isLabelListItem(tx) && tx !== item)
    const firstTx = page.results.find(isTransactionListItem)

    if (
      firstTx &&
      isMultisigExecutionInfo(firstTx.transaction.executionInfo) &&
      (hasNext || firstTx.transaction.executionInfo.nonce !== safe.nonce)
    ) {
      const nextNonce = hasNext ? firstTx.transaction.executionInfo.nonce : safe.nonce

      label = `${label} - transaction with nonce ${nextNonce} needs to be executed first`
    }
  }

  return <div className={css.container}>{label}</div>
}

export default GroupLabel
