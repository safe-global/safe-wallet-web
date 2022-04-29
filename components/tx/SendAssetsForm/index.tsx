import { ReactElement } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  createFilterOptions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { useForm } from 'react-hook-form'

import css from './styles.module.css'
import TokenAmount, { TokenIcon } from '@/components/common/TokenAmount'
import { formatDecimals, toDecimals } from '@/services/formatters'
import { validateAddress } from '@/services/validation'
import useBalances from '@/services/useBalances'
import useAddressBook from '@/services/useAddressBook'

export type SendAssetsFormData = {
  recepient: string
  tokenAddress: string
  amount: string
}

type SendAssetsFormProps = {
  formData?: SendAssetsFormData
  onSubmit: (formData: SendAssetsFormData) => void
}

const abFilterOptions = createFilterOptions({
  stringify: (option: { label: string; name: string }) => option.name + ' ' + option.label,
})

const SendAssetsForm = ({ onSubmit, formData }: SendAssetsFormProps): ReactElement => {
  const { balances } = useBalances()
  const addressBook = useAddressBook()

  const addressBookEntries = Object.entries(addressBook).map(([address, name]) => ({
    label: address,
    name,
  }))

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SendAssetsFormData>({
    defaultValues: formData,
  })

  const validateAmount = (amount: string) => {
    const tokenAddress = getValues('tokenAddress')
    const token = tokenAddress && balances.items.find((item) => item.tokenInfo.address === tokenAddress)

    if (!token) return

    if (toDecimals(amount, token.tokenInfo.decimals).gt(token.balance)) {
      return `Maximum value is ${formatDecimals(token.balance, token.tokenInfo.decimals)}`
    }
  }

  return (
    <form className={css.container} onSubmit={handleSubmit(onSubmit)}>
      <FormControl fullWidth>
        <Autocomplete
          defaultValue={formData?.recepient}
          freeSolo
          disablePortal
          options={addressBookEntries}
          filterOptions={abFilterOptions}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              {option.name}
              <br />
              {option.label}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              autoComplete="off"
              label="Recepient"
              error={!!errors.recepient}
              helperText={errors.recepient?.message}
              {...register('recepient', {
                validate: validateAddress,
                required: true,
              })}
            />
          )}
        />
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="asset-label">Select an asset</InputLabel>
        <Select
          labelId="asset-label"
          label="Select an asset"
          defaultValue={formData?.tokenAddress || ''}
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
          label="Amount"
          error={!!errors.amount}
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
