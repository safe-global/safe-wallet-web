import { type ReactNode, type ReactElement } from 'react'
import { Box } from '@mui/material'
import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'

import css from './styles.module.css'
import type { TokenTransferModalProps } from '.'
import { SendTxType } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import TokenIcon from '@/components/common/TokenIcon'
import ReviewSpendingLimitTx from '@/components/tx/modals/TokenTransferModal/ReviewSpendingLimitTx'
import ReviewMultisigTx from '@/components/tx/modals/TokenTransferModal/ReviewMultisigTx'
import { formatAmountPrecise } from '@/utils/formatNumber'

export const TokenTransferReview = ({
  amount,
  tokenInfo,
  children,
}: {
  amount: number | string
  tokenInfo: TokenInfo
  children?: ReactNode
}) => {
  return (
    <Box className={css.tokenPreview}>
      <Box className={css.tokenIcon}>
        <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />
      </Box>

      <Box mt={1} fontSize={20}>
        {children}
        {formatAmountPrecise(amount, tokenInfo.decimals)} {tokenInfo.symbol}
      </Box>
    </Box>
  )
}

const ReviewTokenTx = ({ params, onSubmit }: TokenTransferModalProps): ReactElement => {
  const isSpendingLimitTx = params.type === SendTxType.spendingLimit

  return isSpendingLimitTx ? (
    <ReviewSpendingLimitTx params={params} onSubmit={onSubmit} />
  ) : (
    <ReviewMultisigTx params={params} onSubmit={onSubmit} />
  )
}

export default ReviewTokenTx
