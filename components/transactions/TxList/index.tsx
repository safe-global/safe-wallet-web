import { useMemo, type ReactElement } from 'react'
import { DateLabel, Transaction, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import TxListItem from '../TxListItem'
import { isDateLabel, isTransaction } from '@/utils/transaction-guards'
import css from './styles.module.css'

type TxListProps = {
  items: TransactionListPage['results']
}

const TxList = ({ items }: TxListProps): ReactElement => {
  // Ensure list always starts with a date label
  const list = useMemo(() => {
    const firstDateLabelIndex = items.findIndex(isDateLabel)
    const firstTxIndex = items.findIndex(isTransaction)
    const shouldPrependDateLabel =
      (firstDateLabelIndex === -1 || firstDateLabelIndex > firstTxIndex) && firstTxIndex !== -1

    if (!shouldPrependDateLabel) {
      return items
    }

    const dateLabel: DateLabel = {
      type: 'DATE_LABEL',
      timestamp: (items[firstTxIndex] as Transaction).transaction.timestamp,
    }

    return [dateLabel, ...items]
  }, [items])

  return (
    <div className={css.listContainer}>
      {list.map((item, index) => (
        <TxListItem key={index} item={item} />
      ))}
    </div>
  )
}

export default TxList
