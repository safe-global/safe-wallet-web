import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import Approvals from '@/components/tx/ApprovalEditor/Approvals'
import EditIcon from '@/public/images/common/edit.svg'
import { createMultiSendCallOnlyTx, createTx } from '@/services/tx/tx-sender'
import { decodeSafeTxToBaseTransactions } from '@/utils/transactions'
import { Alert, Box, Divider, Skeleton, SvgIcon, Typography } from '@mui/material'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { type EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'
import { useContext } from 'react'
import { ApprovalEditorForm } from './ApprovalEditorForm'
import { useApprovalInfos } from './hooks/useApprovalInfos'
import css from './styles.module.css'
import { updateApprovalTxs } from './utils/approvals'

const Title = () => {
  return (
    <div data-sid="14924" className={css.wrapper}>
      <div data-sid="83457" className={css.icon}>
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
  safeMessage,
}: {
  safeTransaction?: SafeTransaction
  safeMessage?: EIP712TypedData
}) => {
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)
  const [readableApprovals, error, loading] = useApprovalInfos({ safeTransaction, safeMessage })

  const nonZeroApprovals = readableApprovals?.filter((approval) => !(0n === approval.amount))

  if (nonZeroApprovals?.length === 0 || (!safeTransaction && !safeMessage)) {
    return null
  }

  const updateApprovals = (approvals: string[]) => {
    if (!safeTransaction) {
      return
    }
    const extractedTxs = decodeSafeTxToBaseTransactions(safeTransaction)
    const updatedTxs = updateApprovalTxs(approvals, readableApprovals, extractedTxs)

    const createSafeTx = async (): Promise<SafeTransaction> => {
      const isMultiSend = updatedTxs.length > 1
      return isMultiSend ? createMultiSendCallOnlyTx(updatedTxs) : createTx(updatedTxs[0])
    }

    createSafeTx().then(setSafeTx).catch(setSafeTxError)
  }

  const isReadOnly = (safeTransaction && safeTransaction.signatures.size > 0) || safeMessage !== undefined

  return (
    <Box data-sid="18128" display="flex" flexDirection="column" gap={2} mb={3}>
      <Title />
      {error ? (
        <Alert severity="error">Error while decoding approval transactions.</Alert>
      ) : loading || !readableApprovals ? (
        <Skeleton variant="rounded" height={100} data-testid="approval-editor-loading" />
      ) : isReadOnly ? (
        <Approvals approvalInfos={readableApprovals} />
      ) : (
        <ApprovalEditorForm approvalInfos={readableApprovals} updateApprovals={updateApprovals} />
      )}

      <Box data-sid="49327" mt={2}>
        <Divider className={commonCss.nestedDivider} />
      </Box>
    </Box>
  )
}

export default ApprovalEditor
