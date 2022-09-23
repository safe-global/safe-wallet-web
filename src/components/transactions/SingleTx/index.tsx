import { CircularProgress } from '@mui/material'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useChainId from '@/hooks/useChainId'
import { useRouter } from 'next/router'
import useSafeInfo from '@/hooks/useSafeInfo'
import useAsync from '@/hooks/useAsync'
import { DateLabel, getTransactionDetails, Transaction, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { sameAddress } from '@/utils/addresses'
import { ReactElement } from 'react'
import { makeDateLabelFromTx, makeTxFromDetails } from '@/utils/transactions'
import { TxListGrid } from '@/components/transactions/TxList'
import TxDateLabel from '@/components/transactions/TxDateLabel'
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'

const SingleTxGrid = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
  const tx: Transaction = makeTxFromDetails(txDetails)
  const dateLabel: DateLabel = makeDateLabelFromTx(tx)

  return (
    <TxListGrid data-testid="single-tx-grid">
      <TxDateLabel item={dateLabel} />
      <ExpandableTransactionItem item={tx} txDetails={txDetails} />
    </TxListGrid>
  )
}

const SingleTx = () => {
  const chainId = useChainId()
  const router = useRouter()
  const { id } = router.query
  const transactionId = Array.isArray(id) ? id[0] : id
  const { safe, safeAddress } = useSafeInfo()

  const [txDetails, txDetailsError, loading] = useAsync<TransactionDetails>(
    () => {
      if (!transactionId) return
      return getTransactionDetails(chainId, transactionId)
    },
    [transactionId, safe.txQueuedTag, safe.txHistoryTag],
    false,
  )
  const isCurrentSafeTx = sameAddress(txDetails?.safeAddress, safeAddress)

  const error =
    transactionId && !isCurrentSafeTx
      ? new Error(`Transaction  with id ${transactionId} not found in this Safe`)
      : txDetailsError || new Error("Couldn't retrieve the transaction details. Please review the URL.")

  if (loading) {
    return <CircularProgress />
  }

  if (txDetails && isCurrentSafeTx) {
    return <SingleTxGrid txDetails={txDetails} />
  }

  return <ErrorMessage error={error}>Failed to load transaction</ErrorMessage>
}

export default SingleTx
