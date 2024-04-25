import { Box, Stack, Typography } from '@mui/material'
import css from '@/components/tx/ApprovalEditor/styles.module.css'
import type { Approval } from '@/services/security/modules/ApprovalModule'
import type { ApprovalInfo } from './hooks/useApprovalInfos'
import TokenIcon from '@/components/common/TokenIcon'
import { PSEUDO_APPROVAL_VALUES } from './utils/approvals'
import { formatAmountPrecise } from '@/utils/formatNumber'

export const approvalMethodDescription: Record<Approval['method'], string> = {
  approve: 'Set allowance to',
  increaseAllowance: 'Increase allowance by',
  Permit2: 'Give permission to spend',
}

const ApprovalItem = ({
  method,
  amount,
  tokenInfo,
}: {
  spender: string
  amount: string
  tokenInfo: NonNullable<ApprovalInfo['tokenInfo']>
  method: Approval['method']
}) => {
  return (
    <Stack direction="row" alignItems="center" gap={2} className={css.approvalField}>
      <TokenIcon logoUri={tokenInfo?.logoUri} tokenSymbol={tokenInfo?.symbol} />
      <Box>
        <Typography variant="body2" color="text.secondary">
          {approvalMethodDescription[method]}
        </Typography>
        {amount === PSEUDO_APPROVAL_VALUES.UNLIMITED ? (
          <Typography>
            {PSEUDO_APPROVAL_VALUES.UNLIMITED} {tokenInfo.symbol && `of ${tokenInfo.symbol}`}
          </Typography>
        ) : (
          <Typography data-testid="token-amount">
            {formatAmountPrecise(amount, tokenInfo.decimals)} {tokenInfo.symbol && `of ${tokenInfo.symbol}`}
          </Typography>
        )}
      </Box>
    </Stack>
  )
}

export default ApprovalItem
