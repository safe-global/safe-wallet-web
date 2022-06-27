import { useMemo, useState, type ReactElement } from 'react'
import { Grid } from '@mui/material'
import type { TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import type { SendAssetsFormData } from '@/components/tx/steps/SendAssetsForm'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { TokenIcon } from '@/components/common/TokenAmount'
import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import useSafeTxGas from '@/hooks/useSafeTxGas'
import useBalances from '@/hooks/useBalances'
import useAsync from '@/hooks/useAsync'
import { createTx } from '@/services/tx/txSender'
import useSafeInfo from '@/hooks/useSafeInfo'
import NonceForm from './NonceForm'
import EthHashInfo from '@/components/common/EthHashInfo'

const TokenTransferReview = ({ params, tokenInfo }: { params: SendAssetsFormData; tokenInfo: TokenInfo }) => {
  return (
    <Grid container sx={{ alignItems: 'center', gap: '1em', margin: '1em 0 2em' }}>
      <div>
        Send <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />
        {params.amount} {tokenInfo.symbol} to
      </div>
      <EthHashInfo address={params.recipient} shortAddress={false} />
    </Grid>
  )
}

type ReviewNewTxProps = {
  params: SendAssetsFormData
  onSubmit: (data: null) => void
}

const ReviewNewTx = ({ params, onSubmit }: ReviewNewTxProps): ReactElement => {
  const { safe } = useSafeInfo()

  // Find the token info for the token we're sending
  const { balances } = useBalances()

  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const { decimals, address } = token?.tokenInfo || {}

  // Format safeTx params
  const txParams = useMemo(() => {
    if (!address || !decimals) return
    return createTokenTransferParams(params.recipient, params.amount, decimals, address)
  }, [params, decimals, address])

  // Estimate safeTxGas
  const { safeGas, safeGasError } = useSafeTxGas(txParams)
  const [editableNonce, setEditableNonce] = useState<number>()

  // Create a safeTx
  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    if (!txParams || editableNonce == null) return

    return createTx({
      ...txParams,
      nonce: editableNonce,
      safeTxGas: safeGas ? Number(safeGas.safeTxGas) : undefined,
    })
  }, [editableNonce, txParams, safeGas?.safeTxGas])

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

      <NonceForm recommendedNonce={safeGas?.recommendedNonce} safeNonce={safe?.nonce} onChange={setEditableNonce} />
    </SignOrExecuteForm>
  )
}

export default ReviewNewTx
