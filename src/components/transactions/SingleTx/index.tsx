import { CircularProgress } from '@mui/material'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { useRouter } from 'next/router'
import useSafeInfo from '@/hooks/useSafeInfo'
import useAsync from '@/hooks/useAsync'
import type { Transaction, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { getTransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { sameAddress } from '@/utils/addresses'
import type { ReactElement } from 'react'
import { makeTxFromDetails } from '@/utils/transactions'
import { TxListGrid } from '@/components/transactions/TxList'
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'
import { GroupLabelTypography, useFutureNonceLabel } from '../GroupLabel'

// Display a warning if the transaction nonce is higher than the current safe nonce
const useNonceWarning = (txDetails: TransactionDetails): string => {
  const { safe } = useSafeInfo()
  const futureNonceLabel = useFutureNonceLabel()

  let nonceWarning = ''
  const executionInfo = txDetails?.detailedExecutionInfo
  if (isMultisigDetailedExecutionInfo(executionInfo) && executionInfo.nonce > safe.nonce) {
    nonceWarning = futureNonceLabel
  }

  return nonceWarning
}

const SingleTxGrid = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
  const tx: Transaction = makeTxFromDetails(txDetails)
  const nonceWarning = useNonceWarning(txDetails)

  return (
    <TxListGrid>
      {nonceWarning && <GroupLabelTypography>{nonceWarning}</GroupLabelTypography>}

      <ExpandableTransactionItem item={tx} txDetails={txDetails} />
    </TxListGrid>
  )
}

const SingleTx = () => {
  const router = useRouter()
  const { id } = router.query
  const transactionId = Array.isArray(id) ? id[0] : id
  const { safe, safeAddress } = useSafeInfo()

  const [txDetails, txDetailsError] = useAsync<TransactionDetails>(
    () => {
      if (!transactionId || !safeAddress) return

      return getTransactionDetails(safe.chainId, transactionId).then((details) => {
        // If the transaction is not related to the current safe, throw an error
        if (!sameAddress(details.safeAddress, safeAddress)) {
          return Promise.reject(new Error('Transaction with this id was not found in this Safe'))
        }
        return details
      })
    },
    [transactionId, safe.chainId, safe.txQueuedTag, safe.txHistoryTag, safeAddress],
    false,
  )

  if (txDetailsError) {
    return <ErrorMessage error={txDetailsError}>Failed to load transaction</ErrorMessage>
  }

  if (txDetails) {
    return <SingleTxGrid txDetails={txDetails} />
  }

  return <CircularProgress />
}

export default SingleTx
