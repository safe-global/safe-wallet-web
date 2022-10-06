import { Box, CircularProgress } from '@mui/material'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useSafeInfo from '@/hooks/useSafeInfo'
import type { Transaction, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import type { ReactElement } from 'react'
import { makeTxFromDetails } from '@/utils/transactions'
import { TxListGrid } from '@/components/transactions/TxList'
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import { useTxDetails } from '@/hooks/useTxDetails'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'
import { GroupLabelTypography, useFutureNonceLabel } from '../GroupLabel'
import { useRouter } from 'next/router'

const SingleTxGrid = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement => {
  const tx: Transaction = makeTxFromDetails(txDetails)

  return (
    <TxListGrid>
      <ExpandableTransactionItem item={tx} txDetails={txDetails} testId="single-tx" />
    </TxListGrid>
  )
}

const SingleTx = () => {
  const router = useRouter()
  const { id } = router.query
  const [txDetails, error] = useTxDetails(Array.isArray(id) ? id[0] : id)
  const futureNonceLabel = useFutureNonceLabel()

  const { safe } = useSafeInfo()

  let nonceWarning: string | undefined = undefined
  const executionInfo = txDetails?.detailedExecutionInfo
  if (isMultisigDetailedExecutionInfo(executionInfo)) {
    if (executionInfo.nonce > safe.nonce) {
      nonceWarning = futureNonceLabel
    }
  }

  if (error) {
    return <ErrorMessage error={error}>Failed to load transaction</ErrorMessage>
  }

  if (txDetails) {
    return (
      <Box display="flex" flexDirection="column" gap={1}>
        {nonceWarning && <GroupLabelTypography label={nonceWarning} />}
        <SingleTxGrid txDetails={txDetails} />
      </Box>
    )
  }

  return <CircularProgress />
}

export default SingleTx
