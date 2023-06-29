import { Alert, Box, Skeleton, SvgIcon, Typography } from '@mui/material'
import { type MetaTransactionData, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import css from './styles.module.css'
import { ApprovalEditorForm } from './ApprovalEditorForm'
import { updateApprovalTxs } from './utils/approvals'
import { useApprovalInfos } from './hooks/useApprovalInfos'
import { decodeSafeTxToBaseTransactions } from '@/utils/transactions'
import EditIcon from '@/public/images/common/edit.svg'

const Title = () => {
  return (
    <div className={css.wrapper}>
      <div className={css.icon}>
        <SvgIcon component={EditIcon} inheritViewBox fontSize="small" />
      </div>
      <div>
        <Typography fontWeight={700}>Approve access to</Typography>
        <Typography variant="body2">
          This allows contracts to spend the selected amounts of your asset balance.
        </Typography>
      </div>
    </div>
  )
}

// TODO: Write tests for this component
export const ApprovalEditor = ({
  safeTransaction,
  updateTransaction,
}: {
  safeTransaction: SafeTransaction | undefined
  updateTransaction?: (txs: MetaTransactionData[]) => void
}) => {
  const [readableApprovals, error, loading] = useApprovalInfos(safeTransaction)

  if (!readableApprovals || readableApprovals.length === 0 || !safeTransaction) {
    return null
  }

  const extractedTxs = decodeSafeTxToBaseTransactions(safeTransaction)

  // If a callback is handed in, we update the txs on change, otherwise a `undefined` callback will change the form to readonly
  const updateApprovals =
    updateTransaction === undefined
      ? undefined
      : (approvals: string[]) => {
          const updatedTxs = updateApprovalTxs(approvals, readableApprovals, extractedTxs)
          updateTransaction(updatedTxs)
        }

  return (
    <Box display="flex" flexDirection="column" gap={2} mb={2}>
      <Title />
      {error ? (
        <Alert severity="error">Error while decoding approval transactions.</Alert>
      ) : loading || !readableApprovals ? (
        <Skeleton variant="rounded" height={126} />
      ) : (
        <ApprovalEditorForm approvalInfos={readableApprovals} updateApprovals={updateApprovals} />
      )}
    </Box>
  )
}

export default ApprovalEditor
