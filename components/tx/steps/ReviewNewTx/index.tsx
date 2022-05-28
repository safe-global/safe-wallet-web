import { useState, type ReactElement } from 'react'
import { Button, FormControl, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'
import type { TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { TokenIcon } from '@/components/common/TokenAmount'
import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import { shortenAddress } from '@/services/formatters'
import ErrorToast from '@/components/common/ErrorToast'
import useSafeTxGas from '@/services/useSafeTxGas'
import useBalances from '@/services/useBalances'
import { type SendAssetsFormData } from '@/components/tx/steps/SendAssetsForm'
import css from './styles.module.css'
import useChainId from '@/services/useChainId'
import useSafeAddress from '@/services/useSafeAddress'
import { createTx, dispatchTxProposal, dispatchTxSigning } from '@/services/tx/txSender'
import useWallet from '@/services/wallets/useWallet'

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

const ReviewNewTx = ({ params, onSubmit }: ReviewNewTxProps): ReactElement => {
  const { balances } = useBalances()
  const safeAddress = useSafeAddress()
  const chainId = useChainId()
  const wallet = useWallet()
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)

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
    if (!txParams || !wallet?.address) return

    const editedTxParams = {
      ...txParams,
      nonce: data.nonce,
      // Core SDK will ignore safeTxGas for 1.3.0+ Safes
      safeTxGas: Number(safeGas?.safeTxGas || 0),
    }

    setIsSubmittable(false)

    try {
      const safeTx = await createTx(editedTxParams)
      const signedTx = await dispatchTxSigning(safeTx)
      await dispatchTxProposal(chainId, safeAddress, wallet.address, signedTx)
    } catch {
      setIsSubmittable(true)
      return
    }

    onSubmit(null)
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

      <div className={css.submit}>
        <Button variant="contained" type="submit" disabled={!isSubmittable}>
          Submit
        </Button>
      </div>

      {safeGasError && <ErrorToast message={safeGasError.message} />}
    </form>
  )
}

export default ReviewNewTx
