import { CircularProgress } from '@mui/material'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useSafeInfo from '@/hooks/useSafeInfo'
import type { Transaction, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { DetailedExecutionInfoType } from '@gnosis.pm/safe-react-gateway-sdk'
import type { ReactElement } from 'react'
import { makeTxFromDetails } from '@/utils/transactions'
import { TxListGrid } from '@/components/transactions/TxList'
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import { useTxDetails } from '@/hooks/useTxDetails'
import css from './styles.module.css'

const SingleTxGrid = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
  const tx: Transaction = makeTxFromDetails(txDetails)

  return (
    <TxListGrid>
      <ExpandableTransactionItem item={tx} txDetails={txDetails} testId="single-tx" />
    </TxListGrid>
  )
}

const SingleTx = () => {
  const [txDetails, error] = useTxDetails()

  const { safe } = useSafeInfo()

  let nonceWarning: string | undefined = undefined
  if (txDetails?.detailedExecutionInfo?.type === DetailedExecutionInfoType.MULTISIG) {
    if (txDetails.detailedExecutionInfo.nonce > safe.nonce) {
      nonceWarning = `- Transaction with nonce ${txDetails.detailedExecutionInfo.nonce - 1} needs to be executed first`
    }
  }

  if (error) {
    return <ErrorMessage error={error}>Failed to load transaction</ErrorMessage>
  }

  if (txDetails) {
    return (
      <div>
        <div className={css.container}>Queue {nonceWarning || ''}</div>
        <SingleTxGrid txDetails={txDetails} />
      </div>
    )
  }

  return <CircularProgress />
}

export default SingleTx
