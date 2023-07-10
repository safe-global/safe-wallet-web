import { Box, Divider, SvgIcon, Typography } from '@mui/material'
import { type MetaTransactionData, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import css from './styles.module.css'
import { ApprovalEditorForm } from './ApprovalEditorForm'
import { updateApprovalTxs } from './utils/approvals'
import { useApprovalInfos } from './hooks/useApprovalInfos'
import { decodeSafeTxToBaseTransactions } from '@/utils/transactions'
import EditIcon from '@/public/images/common/edit.svg'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import Approvals from '@/components/tx/ApprovalEditor/Approvals'

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

export const ApprovalEditor = ({
  safeTransaction,
  updateTransaction,
}: {
  safeTransaction: SafeTransaction | undefined
  updateTransaction?: (txs: MetaTransactionData[]) => void
}) => {
  const [readableApprovals] = useApprovalInfos(safeTransaction)

  if (!readableApprovals || readableApprovals?.length === 0 || !safeTransaction) {
    return null
  }

  const updateApprovals = (approvals: string[]) => {
    if (!updateTransaction) return

    const extractedTxs = decodeSafeTxToBaseTransactions(safeTransaction)

    const updatedTxs = updateApprovalTxs(approvals, readableApprovals, extractedTxs)
    updateTransaction(updatedTxs)
  }

  const isReadOnly = updateTransaction === undefined

  return (
    <Box display="flex" flexDirection="column" gap={2} mb={3}>
      <Title />
      {isReadOnly ? (
        <Approvals approvalInfos={readableApprovals} />
      ) : (
        <ApprovalEditorForm approvalInfos={readableApprovals} updateApprovals={updateApprovals} />
      )}

      <Box mt={2}>
        <Divider className={commonCss.nestedDivider} />
      </Box>
    </Box>
  )
}

export default ApprovalEditor
