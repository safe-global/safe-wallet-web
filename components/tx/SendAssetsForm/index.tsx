import { ReactElement } from 'react'
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { useForm, type FieldValues } from 'react-hook-form'

import css from './styles.module.css'
import { useAppSelector } from 'store'
import { selectBalances } from 'store/balancesSlice'
import TokenAmount, { TokenIcon } from 'components/common/TokenAmount'
import { formatDecimals } from 'services/formatters'
import { validateAddress } from 'services/validation'

export type SendAssetsFormData = {
  recepient: string
  tokenAddress: string
  amount: string
}

const SendAssetsForm = ({ onSubmit }: { onSubmit: (formData: SendAssetsFormData) => void }): ReactElement => {
  const balances = useAppSelector(selectBalances)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const onFormSubmit = async (data: FieldValues) => {
    onSubmit(data as SendAssetsFormData)
  }

  const validateAmount = (amount: string) => {
    const tokenAddress = watch('tokenAddress')
    const token = tokenAddress && balances.items.find((item) => item.tokenInfo.address === tokenAddress)

    if (!token) return

    const maxVal = formatDecimals(token.balance)
    const value = parseFloat(amount)
    const balanceValue = parseFloat(maxVal)

    if (value > balanceValue) {
      return `Maximum value is ${maxVal}`
    }
  }

  return (
    <form className={css.container} onSubmit={handleSubmit(onFormSubmit)}>
      <FormControl fullWidth>
        <TextField
          required
          label="Recepient"
          helperText={errors.recepient?.message}
          {...register('recepient', { required: true, validate: validateAddress })}
        />
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
        <TextField
          required
          label="Amount"
          helperText={errors.amount?.message}
          {...register('amount', { required: true, validate: validateAmount })}
        />
      </FormControl>

      <div className={css.submit}>
        <Button variant="contained" type="submit">
          Next
        </Button>
      </div>
    </form>
  )
}

export default SendAssetsForm
