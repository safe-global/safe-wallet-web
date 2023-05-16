import TokenIcon from '@/components/common/TokenIcon'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Skeleton, Typography } from '@mui/material'
import { groupBy } from 'lodash'
import css from './styles.module.css'
import { UNLIMITED_APPROVAL_AMOUNT } from '@/utils/tokens'
import { ApprovalEditorForm } from './ApprovalEditorForm'
import { type ReactNode } from 'react'
import { type ApprovalInfo, updateApprovalTxs } from './utils/approvals'
import { useApprovalInfos } from './hooks/useApprovalInfos'
import { decodeSafeTxToBaseTransactions } from '@/utils/transactions'
import { type MetaTransactionData, type SafeTransaction } from '@safe-global/safe-core-sdk-types'

const SummaryWrapper = ({ children }: { children: ReactNode | ReactNode[] }) => {
  return (
    <Box display="flex" flexDirection="row" justifyContent="space-between" width="100%">
      <Typography fontWeight={700} display="inline-flex" alignItems="center" gap={1}>
        Approve access to
      </Typography>
      <Typography display="inline-flex" alignItems="center" gap={1} color="warning.main">
        {children}
      </Typography>
    </Box>
  )
}

const Summary = ({ approvalInfos }: { approvalInfos: ApprovalInfo[] }) => {
  const uniqueTokens = groupBy(approvalInfos, (approvalInfo) => approvalInfo.tokenAddress)
  const uniqueTokenCount = Object.keys(uniqueTokens).length

  if (approvalInfos.length === 1) {
    const approval = approvalInfos[0]
    const amount = UNLIMITED_APPROVAL_AMOUNT.eq(approval.amount) ? 'unlimited' : approval.amountFormatted
    return (
      <SummaryWrapper>
        {amount}
        <TokenIcon logoUri={approval.tokenInfo?.logoUri} tokenSymbol={approval.tokenInfo?.symbol} />
        {approval.tokenInfo?.symbol}
      </SummaryWrapper>
    )
  }

  return (
    <SummaryWrapper>
      {uniqueTokenCount} Token{uniqueTokenCount > 1 ? 's' : ''}
    </SummaryWrapper>
  )
}

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
    <Accordion className={css.warningAccordion} disabled={loading} defaultExpanded={true}>
      <AccordionSummary
        expandIcon={
          <IconButton size="small">
            <ExpandMoreIcon />
          </IconButton>
        }
      >
        {' '}
        {error ? (
          <Typography>Error while decoding approval transactions.</Typography>
        ) : loading || !readableApprovals ? (
          <Skeleton />
        ) : (
          <Summary approvalInfos={readableApprovals} />
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ pb: 0 }}>
        {loading || !readableApprovals ? null : (
          <>
            <Typography fontSize="14px">
              This allows contracts to spend the selected amounts of your asset balance.
            </Typography>
            <ApprovalEditorForm approvalInfos={readableApprovals} updateApprovals={updateApprovals} />
          </>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default ApprovalEditor
