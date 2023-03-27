import TokenIcon from '@/components/common/TokenIcon'
import type { BaseTransaction } from '@safe-global/safe-apps-sdk'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Skeleton, Typography } from '@mui/material'
import type { DecodedDataResponse } from '@safe-global/safe-gateway-typescript-sdk'
import { groupBy } from 'lodash'
import css from './styles.module.css'
import { UNLIMITED_APPROVAL_AMOUNT } from '@/utils/tokens'
import { ApprovalEditorForm } from './ApprovalEditorForm'
import { useMemo } from 'react'
import {
  type ApprovalInfo,
  APPROVAL_SIGNATURE_HASH,
  extractTxs,
  updateApprovalTxs,
  PSEUDO_APPROVAL_VALUES,
} from './utils/approvals'
import { useApprovalInfos } from './hooks/useApprovalInfos'

const Summary = ({ approvalInfos, approvalTxs }: { approvalInfos: ApprovalInfo[]; approvalTxs: BaseTransaction[] }) => {
  const uniqueTokens = groupBy(approvalTxs, (tx) => tx.to)
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

export const ApprovalEditor = ({
  txs,
  updateTxs,
}: {
  txs: BaseTransaction[] | (DecodedDataResponse & { to: string })
  updateTxs?: (txs: BaseTransaction[]) => void
}) => {
  const extractedTxs = useMemo(() => extractTxs(txs), [txs])
  const approvalTxs = useMemo(
    () => extractedTxs.filter((tx) => tx.data.startsWith(APPROVAL_SIGNATURE_HASH)),
    [extractedTxs],
  )

  const [approvalInfos, error, loading] = useApprovalInfos(approvalTxs)

  if (approvalTxs.length === 0) {
    return null
  }

  // If a callback is handed in, we update the txs on change, otherwise a `undefined` callback will change the form to readonly
  const updateApprovals =
    updateTxs === undefined
      ? undefined
      : (approvals: string[]) => {
          const updatedTxs = updateApprovalTxs(approvals, approvalInfos, extractedTxs)
          updateTxs(updatedTxs)
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
        ) : loading || !approvalInfos ? (
          <Skeleton />
        ) : (
          <Summary approvalInfos={approvalInfos} approvalTxs={approvalTxs} />
        )}
      </AccordionSummary>
      <AccordionDetails>
        {loading || !approvalInfos ? null : (
          <>
            <Typography fontSize="14px">
              This allows contracts to spend the selected amounts of your asset balance.
            </Typography>
            <ApprovalEditorForm approvalInfos={approvalInfos} updateApprovals={updateApprovals} />
          </>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export default ApprovalEditor
