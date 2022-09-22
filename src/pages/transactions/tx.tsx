import type { ReactElement } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
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
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import { TxListGrid } from '@/components/transactions/TxList'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import TransactionsIcon from '@/public/images/sidebar/transactions.svg'
import useSafeInfo from '@/hooks/useSafeInfo'
import { sameAddress } from '@/utils/addresses'
import { AppRoutes } from '@/config/routes'

const FAILED_TO_LOAD_TX = 'Failed to load transaction'

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
  const breadcrumbsLink = `${AppRoutes.transactions.index}?safe=${safeAddress}`

  return (
    <main>
      <Head>
        <title>Safe – Transaction details</title>
      </Head>

      <Breadcrumbs Icon={TransactionsIcon} first="Transactions" second="Details" firstLink={breadcrumbsLink} />

      {loading ? (
        <CircularProgress />
      ) : !isCurrentSafeTx && transactionId ? (
        <ErrorMessage error={Error(`Transaction with id ${transactionId} not found in this Safe `)}>
          {FAILED_TO_LOAD_TX}
        </ErrorMessage>
      ) : txDetails ? (
        <SingleTxGrid txDetails={txDetails} />
      ) : (
        <ErrorMessage error={error || Error('Resource not found. Please review the url.')}>
          {FAILED_TO_LOAD_TX}
        </ErrorMessage>
      )}
    </main>
  )
}

export default SingleTransaction
