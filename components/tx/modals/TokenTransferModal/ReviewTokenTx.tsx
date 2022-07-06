import { useMemo, type ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import type { TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import css from './styles.module.css'
import { SendAssetsFormData, SendFromBlock } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { TokenIcon } from '@/components/common/TokenAmount'
import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import useSafeTxGas from '@/hooks/useSafeTxGas'
import useBalances from '@/hooks/useBalances'
import useAsync from '@/hooks/useAsync'
import { createTx } from '@/services/tx/txSender'
import useSafeInfo from '@/hooks/useSafeInfo'
import EthHashInfo from '@/components/common/EthHashInfo'

const TokenTransferReview = ({ params, tokenInfo }: { params: SendAssetsFormData; tokenInfo: TokenInfo }) => {
  return (
    <Box className={css.tokenPreview}>
      <Box fontSize={24}>
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
  const { data: safe } = useSafeInfo()

  // Find the token info for the token we're sending
  const { data: balances } = useBalances()

  const token = balances?.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const { decimals, address } = token?.tokenInfo || {}

  // Format safeTx params
  const txParams = useMemo(() => {
    if (!address || !decimals) return
    return createTokenTransferParams(params.recipient, params.amount, decimals, address)
  }, [params, decimals, address])

  // Estimate safeTxGas
  const { safeGas, safeGasError } = useSafeTxGas(txParams)
  const { recommendedNonce = 0 } = safeGas || {}

  // Create a safeTx
  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    if (!txParams || recommendedNonce == null) return

    return createTx({
      ...txParams,
      nonce: recommendedNonce,
      safeTxGas: safeGas ? Number(safeGas.safeTxGas) : undefined,
    })
  }, [recommendedNonce, txParams, safeGas?.safeTxGas])

  // All errors
  const txError = safeTxError || safeGasError

  return (
    <SignOrExecuteForm
      safeTx={safeTx}
      isExecutable={safe?.threshold === 1}
      onSubmit={onSubmit}
      title="Review transaction"
      error={txError}
    >
      {token && <TokenTransferReview params={params} tokenInfo={token.tokenInfo} />}

      <Box mb={3}>
        <SendFromBlock />

        <Typography color={({ palette }) => palette.text.secondary} pb={1}>
          Recipient
        </Typography>

        <Box>
          <EthHashInfo address={safeTx?.data.to || ''} shortAddress={false} />
        </Box>
      </Box>
    </SignOrExecuteForm>
  )
}

export default ReviewTokenTx
