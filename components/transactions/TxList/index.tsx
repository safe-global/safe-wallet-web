import { useMemo, type ReactElement } from 'react'
import { DateLabel, Transaction, type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import TxListItem from '../TxListItem'
import TxDateLabel from '../TxDateLabel'
import { isDateLabel, isTransaction } from '../utils'

type TxListProps = {
  items: TransactionListPage['results']
}

const TxList = ({ items }: TxListProps): ReactElement => {
  const list = useMemo(() => {
    const firstDateLabelIndex = items.findIndex(isDateLabel)
    const firstTxIndex = items.findIndex(isTransaction)
    const shouldPrependDateLabel =
      firstDateLabelIndex === -1 || firstTxIndex === -1 || firstDateLabelIndex > firstTxIndex

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
    <div>
      {list.map((item, index) => (
        <TxListItem key={index} item={item} />
      ))}
    </div>
  )
}

export default TxList
