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

const FAILED_TO_LOAD_TX = 'Failed to load transaction'

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

  const [txDetails, error, loading] = useAsync<TransactionDetails>(
    () => {
      if (!id || !transactionId) return
      return getTransactionDetails(chainId, transactionId)
    },
    [transactionId, safe.txQueuedTag, safe.txHistoryTag],
    false,
  )

  const isCurrentSafeTx = sameAddress(txDetails?.safeAddress, safeAddress)

  if (loading) {
    return <CircularProgress />
  }

  if (!isCurrentSafeTx && transactionId) {
    return (
      <ErrorMessage error={Error(`Transaction with id ${transactionId} not found in this Safe `)}>
        {FAILED_TO_LOAD_TX}
      </ErrorMessage>
    )
  }

  if (txDetails) {
    return <SingleTxGrid txDetails={txDetails} />
  }

  return (
    <ErrorMessage error={error || Error('Resource not found. Please review the url.')}>
      {FAILED_TO_LOAD_TX}
    </ErrorMessage>
  )
}

export default SingleTx
