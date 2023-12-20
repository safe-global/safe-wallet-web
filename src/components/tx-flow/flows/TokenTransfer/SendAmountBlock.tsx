import { type ReactNode } from 'react'
import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, Typography } from '@mui/material'
import TokenIcon from '@/components/common/TokenIcon'
import { formatAmountPrecise } from '@/utils/formatNumber'
import { PSEUDO_APPROVAL_VALUES } from '@/components/tx/ApprovalEditor/utils/approvals'
import FieldsGrid from '@/components/tx/FieldsGrid'

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
      <Box display="flex" alignItems="center" gap={1}>
        <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />

        <Typography fontWeight="bold">{tokenInfo.symbol}</Typography>

        {children}

        {amount === PSEUDO_APPROVAL_VALUES.UNLIMITED ? (
          <Typography>{PSEUDO_APPROVAL_VALUES.UNLIMITED}</Typography>
        ) : (
          <Typography>{formatAmountPrecise(amount, tokenInfo.decimals)}</Typography>
        )}
      </Box>
    </FieldsGrid>
  )
}

export default SendAmountBlock
