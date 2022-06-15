import { type ReactElement } from 'react'
import { TransactionDetails, TransactionSummary, Transfer, TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { TransferTx } from '@/components/transactions/TxInfo'
import TxSigners from '@/components/transactions/TxSigners'
import { isTransferTxInfo } from '@/components/transactions/utils'
import css from './styles.module.css'
import useTxDetails from '@/components/transactions/useTxDetails'

type TransactionSummaryWithDetails = TransactionSummary & {
  txDetails?: TransactionDetails
}
type Props = {
  txWithDetails: TransactionSummaryWithDetails
}

const TransferTxInfoSummary = ({ txInfo }: { txInfo: Transfer }) => {
  const { direction } = txInfo
  return (
    <span>
      {/* Copy should be 'Send' if is a pending transaction */}
      {direction === TransferDirection.INCOMING ? 'Received' : 'Sent'}{' '}
      <span className={css.bold}>
        <TransferTx info={txInfo} withLogo={false} omitSign />
      </span>
      {direction === TransferDirection.INCOMING ? ' from:' : ' to:'}
    </span>
  )
}

const TxData = ({ txWithDetails }: Props): ReactElement => {
  const txInfo = txWithDetails.txInfo
  if (isTransferTxInfo(txInfo)) {
    return <TransferTxInfoSummary txInfo={txInfo} />
  }
  return (
    <>
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eos commodi sit dolorum, ex quod vero necessitatibus
      consequatur maiores cumque id deserunt iure dolor aspernatur?
    </>
  )
}

const TxDetails = ({ txWithDetails }: Props): ReactElement => {
  const { txDetails, loading } = useTxDetails({ txId: txWithDetails.id })

  if (loading) {
    return <div>Loading...</div>
  }

  if (!txDetails) {
    return <div>no data</div>
  }

  return (
    <div className={css.container}>
      {/* /Details */}
      <div className={css.txData}>
        <TxData txWithDetails={txWithDetails} />
      </div>
      {/* Signers */}
      <div className={css.txSigners}>
        <TxSigners txDetails={txDetails} />
      </div>
    </div>
  )
}

export default TxDetails
