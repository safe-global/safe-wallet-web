import { type ReactElement } from 'react'
import { type TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import TxListItem from '../TxListItem'

type TxListProps = {
  items: TransactionListPage['results']
}

const TxList = ({ items }: TxListProps): ReactElement => {
  return (
    <div>
      {items.map((item, index) => (
        <TxListItem key={index} item={item} />
      ))}
    </div>
  )
}

export default TxList
