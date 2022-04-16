import { type ReactElement } from 'react'
import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { type TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { type SendAssetsFormData } from '../SendAssetsForm'
import { Button, FormControl, TextField, Typography } from '@mui/material'
import { TokenIcon } from 'components/common/TokenAmount'
import { createTokenTransferParams, createTransaction } from 'services/createTransaction'
import { shortenAddress } from 'services/formatters'
import { useAppSelector } from 'store'
import { selectBalances } from 'store/balancesSlice'
import { useForm, type FieldValues } from 'react-hook-form'
import css from './styles.module.css'
import useSafeTxGas from 'services/useSafeTxGas'

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

const ReviewTx = ({
  params,
  onSubmit,
}: {
  params: SendAssetsFormData
  onSubmit: (tx: SafeTransaction) => void
}): ReactElement => {
  const balances = useAppSelector(selectBalances)
  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const tokenInfo = token?.tokenInfo
  const txParams = tokenInfo
    ? createTokenTransferParams(params.recepient, params.amount, tokenInfo.decimals, tokenInfo.address)
    : undefined
  const { safeGas, error, loading } = useSafeTxGas(txParams)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onFormSubmit = async (data: FieldValues) => {
    if (!txParams) return

    const editedTxParams = {
      ...txParams,
      nonce: data.nonce,
      // @TODO: Safes <1.3.0 need safeTxGas
      //safeTxGas: safeGas?.safeTxGas
    }

    const tx = await createTransaction(editedTxParams)

    onSubmit(tx)
  }

  return (
    <form className={css.container} onSubmit={handleSubmit(onFormSubmit)}>
      <Typography variant="h6">Review transaction</Typography>

      {tokenInfo && <TokenTransferReview params={params} tokenInfo={tokenInfo} />}

      <FormControl fullWidth>
        <TextField
          key={safeGas?.recommendedNonce}
          disabled={loading}
          label="Nonce"
          defaultValue={safeGas?.recommendedNonce}
          {...register('nonce')}
        />
      </FormControl>

      <div className={css.submit}>
        <Button variant="contained" type="submit">
          Create transaction
        </Button>
      </div>
    </form>
  )
}

export default ReviewTx
