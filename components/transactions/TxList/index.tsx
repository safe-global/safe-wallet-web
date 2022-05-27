import { useMemo, type ReactElement } from 'react'
import { type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import TxListItem from '../TxListItem'
import TxDateLabel from '../TxDateLabel'
import { isDateLabel, isTransaction } from '../utils'

type TxListProps = {
  items: TransactionListPage['results']
}

const TxList = ({ items }: TxListProps): ReactElement => {
  const shouldPrependDateLabel = useMemo(() => {
    const firstDateLabelIndex = items.findIndex(isDateLabel)
    const firstTxIndex = items.findIndex(isTransaction)
    return firstDateLabelIndex === -1 || firstTxIndex === -1 || firstDateLabelIndex > firstTxIndex
  }, [items])

  const firstTx = useMemo(() => {
    return items.find(isTransaction)
  }, [items])

  return (
    <div>
      {shouldPrependDateLabel && firstTx && (
        <TxDateLabel
          item={{
            type: 'DATE_LABEL',
            timestamp: firstTx.transaction.timestamp,
          }}
        />
      )}
      {items.map((item, index) => (
        <TxListItem key={index} item={item} />
      ))}
    </div>
  )
}

export default TxList
