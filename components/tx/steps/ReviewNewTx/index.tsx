import { useMemo, type ReactElement } from 'react'
import { FormControl, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import type { TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import type { SendAssetsFormData } from '@/components/tx/steps/SendAssetsForm'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { TokenIcon } from '@/components/common/TokenAmount'
import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import { shortenAddress } from '@/services/formatters'
import ErrorToast from '@/components/common/ErrorToast'
import useSafeTxGas from '@/services/useSafeTxGas'
import useBalances from '@/services/useBalances'
import useAsync from '@/services/useAsync'
import { createTx } from '@/services/tx/txSender'

const TokenTransferReview = ({ params, tokenInfo }: { params: SendAssetsFormData; tokenInfo: TokenInfo }) => {
  return (
    <p>
      Send <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />
      {params.amount} {tokenInfo.symbol}
      {' to '}
      {shortenAddress(params.recipient)}
    </p>
  )
}

type ReviewTxForm = {
  nonce: number
}

type ReviewNewTxProps = {
  params: SendAssetsFormData
  onSubmit: (data: null) => void
}

const NONCE_FIELD = 'nonce'

const ReviewNewTx = ({ params, onSubmit }: ReviewNewTxProps): ReactElement => {
  const { balances } = useBalances()
  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const { decimals, address } = token?.tokenInfo || {}

  // Format safeTx params
  const txParams = useMemo(() => {
    if (!address || !decimals) return
    return createTokenTransferParams(params.recipient, params.amount, decimals, address)
  }, [params, decimals, address])

  // Estimate safeTxGas
  const { safeGas, safeGasError, safeGasLoading } = useSafeTxGas(txParams)

  // Watch the advanced params form (nonce)
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<ReviewTxForm>()
  const editableNonce = watch(NONCE_FIELD)

  // Create a safeTx
  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    if (!txParams) return
    return createTx({
      ...txParams,
      nonce: editableNonce,
    })
  }, [editableNonce, txParams])

  // All errors
  const error = safeTxError || safeGasError

  return (
    <div>
      <Typography variant="h6">Review transaction</Typography>

      {token && <TokenTransferReview params={params} tokenInfo={token.tokenInfo} />}

      <FormControl fullWidth>
        <TextField
          disabled={safeGasLoading}
          label="Nonce"
          error={!!errors.nonce}
          helperText={errors.nonce?.message}
          type="number"
          key={safeGas?.recommendedNonce}
          defaultValue={safeGas?.recommendedNonce}
          {...register(NONCE_FIELD, {
            valueAsNumber: true, // Set field to number type to auto parseInt
            required: true,
          })}
        />
      </FormControl>

      {safeTx && <SignOrExecuteForm safeTx={safeTx} onSubmit={onSubmit} />}

      {error && <ErrorToast message={error.message} />}
    </div>
  )
}

export default ReviewNewTx
