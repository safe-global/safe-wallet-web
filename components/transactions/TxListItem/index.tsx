import { type ReactElement } from 'react'
import type { ConflictHeader, DateLabel, Label, Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import TxSummary from '../TxSummary'
import DateLabel from '../DateLabel'
import GroupLabel from '../GroupLabel'

type TxListItemProps = {
  item: Transaction | DateLabel | Label | ConflictHeader
}

const TxListItem = ({ item }: TxListItemProps): ReactElement => {
  switch (item.type) {
    case 'LABEL':
      return <GroupLabel item={item} />
    case 'DATE_LABEL':
      return <DateLabel item={item} />
    case 'TRANSACTION':
      return <TxSummary item={item} />
    default:
      return <></> // ignore ConflictHeader
  }
}

export default TxListItem
