import TokenIcon from '@/components/common/TokenIcon'
import { PSEUDO_APPROVAL_VALUES } from '@/components/tx/ApprovalEditor/utils/approvals'
import FieldsGrid from '@/components/tx/FieldsGrid'
import { formatAmountPrecise } from '@/utils/formatNumber'
import { Box, Typography } from '@mui/material'
import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type ReactNode } from 'react'

const SendAmountBlock = ({
  amount,
  tokenInfo,
  children,
  title = 'Send',
}: {
  amount: number | string
  tokenInfo: Omit<TokenInfo, 'name' | 'logoUri'> & { logoUri?: string }
  children?: ReactNode
  title?: string
}) => {
  return (
    <FieldsGrid title={title}>
      <Box data-sid="22269" display="flex" alignItems="center" gap={1}>
        <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />

        <Typography fontWeight="bold">{tokenInfo.symbol}</Typography>

        {children}

        {amount === PSEUDO_APPROVAL_VALUES.UNLIMITED ? (
          <Typography>{PSEUDO_APPROVAL_VALUES.UNLIMITED}</Typography>
        ) : (
          <Typography data-testid="token-amount">{formatAmountPrecise(amount, tokenInfo.decimals)}</Typography>
        )}
      </Box>
    </FieldsGrid>
  )
}

export default SendAmountBlock
