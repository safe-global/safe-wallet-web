import { type ReactElement } from 'react'
import { TransactionDetails, TransactionSummary, Transfer, TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { TransferTx } from '@/components/transactions/TxInfo'
import { isTransferTxInfo } from '@/components/transactions/utils'
import css from './styles.module.css'

type TransactionSummaryWithDetails = TransactionSummary & {
  txDetails?: TransactionDetails
}
type Props = {
  transactionWithDetails: TransactionSummaryWithDetails
}

const TransferTxInfoSummary = ({ txInfo }: { txInfo: Transfer }) => {
  return <TransferTx info={txInfo} withLogo={false} />
}

const TxData = ({ txWithDetails }: { txWithDetails: TransactionSummaryWithDetails }): ReactElement => {
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

const TxDetails = ({ transactionWithDetails }: Props): ReactElement => {
  return (
    <div className={css.container}>
      {/* /Details */}
      <div className={css.txData}>
        <TxData txWithDetails={transactionWithDetails} />
      </div>
      {/* Signers */}
      <div className={css.txSigners}>Signers</div>
    </div>
  )
}

export default TxDetails
