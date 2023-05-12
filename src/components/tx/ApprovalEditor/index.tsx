import TokenIcon from '@/components/common/TokenIcon'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Skeleton, Typography } from '@mui/material'
import { groupBy } from 'lodash'
import css from './styles.module.css'
import { UNLIMITED_APPROVAL_AMOUNT } from '@/utils/tokens'
import { ApprovalEditorForm } from './ApprovalEditorForm'
import { useContext } from 'react'
import { type ApprovalInfo, updateApprovalTxs, PSEUDO_APPROVAL_VALUES } from './utils/approvals'
import { useApprovalInfos } from './hooks/useApprovalInfos'
import { TransactionInsightContext } from '../TransactionInsightContext'
import { decodeSafeTxToBaseTransactions } from '@/utils/transactions'

const Summary = ({ approvalInfos }: { approvalInfos: ApprovalInfo[] }) => {
  const uniqueTokens = groupBy(approvalInfos, (approvalInfo) => approvalInfo.tokenAddress)
  const uniqueTokenCount = Object.keys(uniqueTokens).length

  if (approvalInfos.length === 1) {
    const approval = approvalInfos[0]
    const amount = UNLIMITED_APPROVAL_AMOUNT.eq(approval.amount)
      ? PSEUDO_APPROVAL_VALUES.UNLIMITED
      : approval.amountFormatted
    return (
      <Box display="flex" flexDirection="row" justifyContent="space-between" width="100%">
        <Typography fontWeight={700} display="inline-flex" alignItems="center" gap={1}>
          Approve access to
        </Typography>
        <Typography display="inline-flex" alignItems="center" gap={1} color="warning.main">
          {amount}
          <TokenIcon logoUri={approval.tokenInfo?.logoUri} tokenSymbol={approval.tokenInfo?.symbol} />
          {approval.tokenInfo?.symbol}
        </Typography>
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="row" justifyContent="space-between" width="100%">
      <Typography fontWeight={700} display="inline-flex" alignItems="center" gap={1}>
        Approve access to
      </Typography>
      <Typography display="inline-flex" alignItems="center" gap={1} color="warning.main">
        {uniqueTokenCount} Token{uniqueTokenCount > 1 ? 's' : ''}
      </Typography>
    </Box>
  )
}

export const ApprovalEditor = () => {
  const { approvalData, updateTransaction, safeTransaction } = useContext(TransactionInsightContext)

  const [readableApprovals, error, loading] = useApprovalInfos(approvalData)

  if (!readableApprovals || readableApprovals.length === 0 || !safeTransaction) {
    return null
  }

  console.log('Rendering editor')

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
      <AccordionDetails>
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
