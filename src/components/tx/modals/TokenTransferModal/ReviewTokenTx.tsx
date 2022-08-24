import { type ReactNode, type ReactElement } from 'react'
import { Box } from '@mui/material'
import type { TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import css from './styles.module.css'
import { SendAssetsFormData, SendTxType } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import { TokenIcon } from '@/components/common/TokenAmount'
import ReviewSpendingLimitTx from '@/components/tx/modals/TokenTransferModal/ReviewSpendingLimitTx'
import ReviewMultisigTx from '@/components/tx/modals/TokenTransferModal/ReviewMultisigTx'

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
        {amount} {tokenInfo.symbol}
      </Box>
    </Box>
  )
}

export type ReviewTokenTxProps = {
  params: SendAssetsFormData
  onSubmit: (data: null) => void
}

const ReviewTokenTx = ({ params, onSubmit }: ReviewTokenTxProps): ReactElement => {
  const isSpendingLimitTx = params.type === SendTxType.spendingLimit

  return isSpendingLimitTx ? (
    <ReviewSpendingLimitTx params={params} onSubmit={onSubmit} />
  ) : (
    <ReviewMultisigTx params={params} onSubmit={onSubmit} />
  )
}

export default ReviewTokenTx
