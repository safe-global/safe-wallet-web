import { Box, Stack, Typography } from '@mui/material'
import css from '@/components/tx/ApprovalEditor/styles.module.css'
import type { Approval } from '@/services/security/modules/ApprovalModule'
import type { ApprovalInfo } from './hooks/useApprovalInfos'
import TokenIcon from '@/components/common/TokenIcon'
import { PSEUDO_APPROVAL_VALUES } from './utils/approvals'
import { formatAmountPrecise } from '@/utils/formatNumber'

export const approvalMethodDescription: Record<Approval['method'], (symbol: string) => string> = {
  approve: (symbol: string) => `Set ${symbol} allowance to`,
  increaseAllowance: (symbol: string) => `Increase ${symbol} allowance by`,
  Permit2: (symbol: string) => `Give permission to spend ${symbol}`,
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
      <TokenIcon size={32} logoUri={tokenInfo?.logoUri} tokenSymbol={tokenInfo?.symbol} />
      <Box>
        <Typography variant="body2" color="text.secondary">
          {approvalMethodDescription[method](tokenInfo.symbol ?? '')}
        </Typography>
        {amount === PSEUDO_APPROVAL_VALUES.UNLIMITED ? (
          <Typography>{PSEUDO_APPROVAL_VALUES.UNLIMITED}</Typography>
        ) : (
          <Typography data-testid="token-amount">{formatAmountPrecise(amount, tokenInfo.decimals)}</Typography>
        )}
      </Box>
    </Stack>
  )
}

export default ApprovalItem
