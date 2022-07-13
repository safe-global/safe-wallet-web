import type { ReactElement } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { CircularProgress } from '@mui/material'
import {
  type DateLabel,
  type Transaction,
  type TransactionDetails,
  getTransactionDetails,
} from '@gnosis.pm/safe-react-gateway-sdk'

import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { makeDateLabelFromTx, makeTxFromDetails } from '@/utils/transactions'
import ErrorMessage from '@/components/tx/ErrorMessage'
import TxDateLabel from '@/components/transactions/TxDateLabel'
import { ExpandableTransactionItem } from '@/components/transactions/TxListItem'
import { TxListGrid } from '@/components/transactions/TxList'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import TransactionsIcon from '@/public/images/sidebar/transactions.svg'

const SingleTxGrid = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
  const tx: Transaction = makeTxFromDetails(txDetails)
  const dateLabel: DateLabel = makeDateLabelFromTx(tx)

  return (
    <TxListGrid>
      <TxDateLabel item={dateLabel} />
      <ExpandableTransactionItem item={tx} txDetails={txDetails} />
    </TxListGrid>
  )
}

const SingleTransaction: NextPage = () => {
  const chainId = useChainId()
  const router = useRouter()
  const { id = '' } = router.query
  const transactionId = Array.isArray(id) ? id[0] : id

  const [txDetails, error, loading] = useAsync<TransactionDetails>(() => {
    return getTransactionDetails(chainId, transactionId)
  }, [transactionId])

  return (
    <main>
      <Breadcrumbs icon={TransactionsIcon} parent="Transactions" child="Details" />

      {loading ? (
        <CircularProgress />
      ) : txDetails ? (
        <SingleTxGrid txDetails={txDetails} />
      ) : (
        error && <ErrorMessage error={error}>Failed loading transaction {transactionId}</ErrorMessage>
      )}
    </main>
  )
}

export default SingleTransaction
