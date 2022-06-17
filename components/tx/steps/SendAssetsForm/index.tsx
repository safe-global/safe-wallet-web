import { ReactElement } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  createFilterOptions,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'

import css from './styles.module.css'
import TokenAmount, { TokenIcon } from '@/components/common/TokenAmount'
import { formatDecimals, toDecimals } from '@/services/formatters'
import { validateAddress } from '@/services/validation'
import useBalances from '@/services/useBalances'
import useAddressBook from '@/services/useAddressBook'
import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeAddress from '@/services/useSafeAddress'

export type SendAssetsFormData = {
  recipient: string
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
  const address = useSafeAddress()
  const { balances } = useBalances()
  const addressBook = useAddressBook()

  const nativeToken = balances.items.find((item) => parseInt(item.tokenInfo.address, 16) === 0)
  const nativeTokenBalance = nativeToken ? formatDecimals(nativeToken.balance, nativeToken.tokenInfo.decimals) : '0'

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

    if (isNaN(parseFloat(amount))) {
      return 'The amount must be a number'
    }

    if (parseFloat(amount) <= 0) {
      return 'The amount must be greater than 0'
    }

    if (toDecimals(amount, token.tokenInfo.decimals).gt(token.balance)) {
      return `Maximum value is ${formatDecimals(token.balance, token.tokenInfo.decimals)}`
    }
  }

  return (
    <form className={css.container} onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Typography variant="subtitle1" pb={1}>
          Sending from
        </Typography>

        <Box fontSize={14}>
          <EthHashInfo address={address} shortAddress={false} />
        </Box>

        {nativeToken && (
          <Box className={css.balance} bgcolor={(theme) => theme.palette.grey.A100}>
            Balance:{' '}
            <b>
              {nativeTokenBalance} {nativeToken.tokenInfo.symbol}
            </b>
          </Box>
        )}
      </div>

      <FormControl fullWidth>
        <Autocomplete
          defaultValue={formData?.recipient}
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
              label="Recipient"
              error={!!errors.recipient}
              helperText={errors.recipient?.message || ' '}
              {...register('recipient', {
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
          error={!!errors.tokenAddress}
          {...register('tokenAddress', { required: true })}
        >
          {balances.items.map((item) => (
            <MenuItem value={item.tokenInfo.address} key={item.tokenInfo.address}>
              <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />
              {item.tokenInfo.name} (<TokenAmount value={item.balance} decimals={item.tokenInfo.decimals} />)
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{errors.tokenAddress?.message || ' '}</FormHelperText>
      </FormControl>

      <FormControl fullWidth>
        <TextField
          label="Amount"
          error={!!errors.amount}
          helperText={errors.amount?.message || ' '}
          autoComplete="off"
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
