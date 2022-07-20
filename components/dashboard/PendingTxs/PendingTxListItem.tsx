import { ReactElement } from 'react'
import { Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import TxSummary from '@/components/transactions/TxSummary'
import { Card } from '../styled'

type PendingTxType = {
  transaction: Transaction
  url: string
}

const PendingTxLisyItem = ({ transaction, url }: PendingTxType): ReactElement => {
  return (
    <a href={url}>
      <Card>
        <TxSummary item={transaction} />
      </Card>
    </a>
  )
}

export default PendingTxLisyItem
