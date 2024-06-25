import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { createMultiSendCallOnlyTx, createTx } from '@/services/tx/tx-sender'
import { Alert, Box, Skeleton, Typography } from '@mui/material'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { useContext } from 'react'
import css from './styles.module.css'
import { ApprovalEditorForm } from './ApprovalEditorForm'
import { updateApprovalTxs } from './utils/approvals'
import { useApprovalInfos } from './hooks/useApprovalInfos'
import { decodeSafeTxToBaseTransactions } from '@/utils/transactions'
import Approvals from '@/components/tx/ApprovalEditor/Approvals'
import { type EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'

const Title = () => {
  return (
    <div>
      <Typography fontWeight={700}>Allow access to tokens?</Typography>
      <Typography variant="body2">This allows the spender to spend the specified amount of your tokens.</Typography>
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
    <Box display="flex" flexDirection="column" gap={2} className={css.container}>
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
    </Box>
  )
}

export default ApprovalEditor
