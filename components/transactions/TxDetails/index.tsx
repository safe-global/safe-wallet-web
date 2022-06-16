import { type ReactElement } from 'react'
import { TransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import TxSigners from '@/components/transactions/TxSigners'
import useTxDetails from '@/components/transactions/useTxDetails'
import Summary from '@/components/transactions/TxDetails/Summary'
import TxData from '@/components/transactions/TxDetails/TxData'
import css from './styles.module.css'

type TransactionSummaryWithDetails = TransactionSummary & {
  txDetails?: TransactionDetails
}
export type TxDetailsProps = {
  txWithDetails: TransactionSummaryWithDetails
}

const TxDetails = ({ txWithDetails }: TxDetailsProps): ReactElement => {
  const { txDetails, loading } = useTxDetails({ txId: txWithDetails.id })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className={css.container}>
      {/* /Details */}
      <div className={css.details}>
        <div className={css.txData}>
          <TxData txWithDetails={txWithDetails} />
        </div>
        <div className={css.txSummary}>
          <Summary txDetails={txDetails} />
        </div>
      </div>
      {/* Signers */}
      {txDetails && (
        <div className={css.txSigners}>
          <TxSigners txDetails={txDetails} />
        </div>
      )}
    </div>
  )
}

export default TxDetails
