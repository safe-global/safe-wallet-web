import { ReactElement } from 'react'
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { useForm, type FieldValues } from 'react-hook-form'
import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import css from './styles.module.css'
import { useAppSelector } from 'store'
import { selectBalances } from 'store/balancesSlice'
import TokenAmount, { TokenIcon } from 'components/common/TokenAmount'
import { createTokenTransferTx } from 'services/createTransaction'

export type SendAssetsFormData = {
  recepient: string
  tokenAddress: string
  amount: string
}

type SendAssetsFormProps = {
  onSubmit: (tx: SafeTransaction) => void
}

const SendAssetsForm = ({ onSubmit }: SendAssetsFormProps): ReactElement => {
  const balances = useAppSelector(selectBalances)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onFormSubmit = async (data: FieldValues) => {
    const token = balances.items.find((item) => item.tokenInfo.address === data.tokenAddress)
    if (!token) return
    const tx = await createTokenTransferTx(
      data.recepient,
      data.amount,
      token.tokenInfo.decimals,
      token.tokenInfo.address,
    )
    onSubmit(tx)
  }

  return (
    <form className={css.container} onSubmit={handleSubmit(onFormSubmit)}>
      <FormControl fullWidth>
        <TextField required label="Recepient" {...register('recepient', { required: true })} />
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="asset-label">Select an asset</InputLabel>
        <Select
          labelId="asset-label"
          label="Select an asset"
          defaultValue=""
          {...register('tokenAddress', { required: true })}
        >
          {balances.items.map((item) => (
            <MenuItem value={item.tokenInfo.address} key={item.tokenInfo.address}>
              <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />
              {item.tokenInfo.name} (<TokenAmount value={item.balance} decimals={item.tokenInfo.decimals} />)
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <TextField required label="Amount" {...register('amount', { required: true })} />
      </FormControl>

      <div className={css.submit}>
        <Button variant="contained" type="submit">
          Create transaction
        </Button>
      </div>
    </form>
  )
}

export default SendAssetsForm
