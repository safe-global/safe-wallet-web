import { type ReactElement } from 'react'
import { getTransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import TxSigners from '@/components/transactions/TxSigners'
import Summary from '@/components/transactions/TxDetails/Summary'
import TxData from '@/components/transactions/TxDetails/TxData'
import useChainId from '@/services/useChainId'
import useAsync from '@/services/useAsync'
import css from './styles.module.css'

const TxDetails = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const chainId = useChainId()
  const [txDetails, , loading] = useAsync(async () => {
    return getTransactionDetails(chainId, txSummary.id)
  }, [chainId, txSummary.id])

  if (loading || !txDetails) {
    return <div>Loading...</div>
  }

  return (
    <div className={css.container}>
      {/* /Details */}
      <div className={css.details}>
        <div className={css.txData}>
          <TxData txDetails={txDetails} />
        </div>
        <div className={css.txSummary}>
          <Summary txDetails={txDetails} />
        </div>
      </div>
      {/* Signers */}
      {txDetails && (
        <div className={css.txSigners}>
          <TxSigners txDetails={txDetails} txSummary={txSummary} />
        </div>
      )}
    </div>
  )
}

export default TxDetails
