import { type ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import type { TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import css from './styles.module.css'
import { SendAssetsFormData } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { TokenIcon } from '@/components/common/TokenAmount'
import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import useBalances from '@/hooks/useBalances'
import useAsync from '@/hooks/useAsync'
import { createTx } from '@/services/tx/txSender'
import useSafeInfo from '@/hooks/useSafeInfo'
import EthHashInfo from '@/components/common/EthHashInfo'
import SendFromBlock from '../../SendFromBlock'

const TokenTransferReview = ({ params, tokenInfo }: { params: SendAssetsFormData; tokenInfo: TokenInfo }) => {
  return (
    <Box className={css.tokenPreview}>
      <Box className={css.tokenIcon}>
        <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />
      </Box>

      <Box mt={1} fontSize={20}>
        {params.amount} {tokenInfo.symbol}
      </Box>
    </Box>
  )
}

type ReviewTokenTxProps = {
  params: SendAssetsFormData
  onSubmit: (data: null) => void
}

const ReviewTokenTx = ({ params, onSubmit }: ReviewTokenTxProps): ReactElement => {
  const { safe } = useSafeInfo()

  // Find the token info for the token we're sending
  const { balances } = useBalances()

  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const { decimals, address } = token?.tokenInfo || {}

  // Create a safeTx
  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    if (!address || !decimals) return
    const txParams = createTokenTransferParams(params.recipient, params.amount, decimals, address)
    return createTx(txParams)
  }, [params, decimals, address])

  return (
    <SignOrExecuteForm safeTx={safeTx} isExecutable={safe.threshold === 1} onSubmit={onSubmit} error={safeTxError}>
      {token && <TokenTransferReview params={params} tokenInfo={token.tokenInfo} />}

      <SendFromBlock />

      <Typography color={({ palette }) => palette.text.secondary} pb={1}>
        Recipient
      </Typography>

      <Box mb={3}>
        <EthHashInfo address={params.recipient} shortAddress={false} hasExplorer showCopyButton />
      </Box>
    </SignOrExecuteForm>
  )
}

export default ReviewTokenTx
