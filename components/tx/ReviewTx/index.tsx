import { useState, type ReactElement } from 'react'
import { Button, FormControl, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import type { TokenInfo, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'

import { TokenIcon } from '@/components/common/TokenAmount'
import { createTokenTransferParams } from '@/services/createTransaction'
import { shortenAddress } from '@/services/formatters'
import ErrorToast from '@/components/common/ErrorToast'
import useSafeTxGas from '@/services/useSafeTxGas'
import useBalances from '@/services/useBalances'
import { type SendAssetsFormData } from '@/components/tx/SendAssetsForm'
import css from '@/components/tx/ReviewTx/styles.module.css'
import { useAppDispatch } from '@/store'
import useChainId from '@/services/useChainId'
import useSafeAddress from '@/services/useSafeAddress'
import { dispatchTxCreation } from '@/services/txSender'

const TokenTransferReview = ({ params, tokenInfo }: { params: SendAssetsFormData; tokenInfo: TokenInfo }) => {
  return (
    <p>
      Send <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />
      {params.amount}
      {tokenInfo.symbol}
      {' to '}
      {shortenAddress(params.recipient)}
    </p>
  )
}

type ReviewTxForm = {
  nonce: number
}

const ReviewTx = ({ params }: { params: SendAssetsFormData }): ReactElement => {
  const { balances } = useBalances()
  const safeAddress = useSafeAddress()
  const chainId = useChainId()
  const dispatch = useAppDispatch()
  const [txDetails, setTxDetails] = useState<TransactionDetails>()

  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const tokenInfo = token?.tokenInfo
  const txParams = tokenInfo
    ? createTokenTransferParams(params.recipient, params.amount, tokenInfo.decimals, tokenInfo.address)
    : undefined
  const { safeGas, safeGasError, safeGasLoading } = useSafeTxGas(txParams)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewTxForm>()

  const onFormSubmit = async (data: ReviewTxForm) => {
    if (!txParams) return

    const editedTxParams = {
      ...txParams,
      nonce: data.nonce,
      // Core SDK will ignore safeTxGas for 1.3.0+ Safes
      safeTxGas: Number(safeGas?.safeTxGas || 0),
    }

    const createdTx = await dispatch(dispatchTxCreation(chainId, safeAddress, editedTxParams))

    if (createdTx) setTxDetails(createdTx)
  }

  return (
    <form className={css.container} onSubmit={handleSubmit(onFormSubmit)}>
      <Typography variant="h6">Review transaction</Typography>

      {tokenInfo && <TokenTransferReview params={params} tokenInfo={tokenInfo} />}

      <FormControl fullWidth>
        <TextField
          disabled={safeGasLoading}
          label="Nonce"
          error={!!errors.nonce}
          helperText={errors.nonce?.message}
          type="number"
          key={safeGas?.recommendedNonce}
          defaultValue={safeGas?.recommendedNonce}
          {...register('nonce', {
            valueAsNumber: true, // Set field to number type to auto parseInt
            required: true,
          })}
        />
      </FormControl>

      <pre>{JSON.stringify(txDetails, null, 2)}</pre>

      <div className={css.submit}>
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </div>

      {safeGasError && <ErrorToast message={safeGasError.message} />}
    </form>
  )
}

export default ReviewTx
