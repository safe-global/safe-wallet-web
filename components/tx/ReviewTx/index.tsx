import { useState, type ReactElement } from 'react'
import { Button, FormControl, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import type { TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { TokenIcon } from '@/components/common/TokenAmount'
import { createTokenTransferParams, createTransaction } from '@/services/createTransaction'
import { shortenAddress } from '@/services/formatters'
import ErrorToast from '@/components/common/ErrorToast'
import useSafeTxGas from '@/services/useSafeTxGas'
import useBalances from '@/services/useBalances'
import { type SendAssetsFormData } from '@/components/tx/SendAssetsForm'
import css from '@/components/tx/ReviewTx/styles.module.css'

const TokenTransferReview = ({ params, tokenInfo }: { params: SendAssetsFormData; tokenInfo: TokenInfo }) => {
  return (
    <p>
      Send <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />
      {params.amount}
      {tokenInfo.symbol}
      {' to '}
      {shortenAddress(params.recepient)}
    </p>
  )
}

type ReviewTxForm = {
  nonce: number
}

const ReviewTx = ({
  params,
  onSubmit,
}: {
  params: SendAssetsFormData
  onSubmit: (tx: SafeTransaction) => void
}): ReactElement => {
  const balances = useBalances()
  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const tokenInfo = token?.tokenInfo
  const txParams = tokenInfo
    ? createTokenTransferParams(params.recepient, params.amount, tokenInfo.decimals, tokenInfo.address)
    : undefined
  const [creationError, setCreationError] = useState<Error>()
  const { safeGas, safeGasError, safeGasLoading } = useSafeTxGas(txParams)

  const anyError = creationError || safeGasError

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewTxForm>({
    defaultValues: { nonce: safeGas?.recommendedNonce || 0 },
  })

  const onFormSubmit = async (data: ReviewTxForm) => {
    if (!txParams) return

    const editedTxParams = {
      ...txParams,
      nonce: data.nonce,
      // @TODO: Safes <1.3.0 need safeTxGas
      //safeTxGas: Number(safeGas?.safeTxGas || 0)
    }

    try {
      const tx = await createTransaction(editedTxParams)
      onSubmit(tx)
    } catch (err) {
      setCreationError(err as Error)
    }
  }

  const validateNonce = (userNonce: number) => {
    if (!Number.isInteger(userNonce)) {
      return 'Nonce must be a number'
    }
  }

  // We must destructure the ref in order to focus MUI fields on error
  const { ref: nonceFieldRef, ...nonceField } = {
    ...register('nonce', {
      valueAsNumber: true, // Set field to number type to auto parseInt
      validate: validateNonce,
      required: true,
    }),
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
          inputRef={nonceFieldRef}
          type="number"
          {...nonceField}
        />
      </FormControl>

      <div className={css.submit}>
        <Button variant="contained" type="submit">
          Create transaction
        </Button>
      </div>

      {anyError && <ErrorToast message={anyError.message} />}
    </form>
  )
}

export default ReviewTx
