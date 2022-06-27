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
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'

import css from './styles.module.css'
import TokenAmount, { TokenIcon } from '@/components/common/TokenAmount'
import { formatDecimals, toDecimals } from '@/utils/formatters'
import { validateAddress } from '@/utils/validation'
import useBalances from '@/hooks/useBalances'
import useAddressBook from '@/hooks/useAddressBook'
import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeAddress from '@/hooks/useSafeAddress'
import TxModalTitle from '../../TxModalTitle'

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

    if (isNaN(Number(amount))) {
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
      <TxModalTitle>Send funds</TxModalTitle>

      <Box sx={{ borderBottom: ({ palette }) => `1px solid ${palette.divider}` }} paddingBottom={2} marginBottom={2}>
        <Typography color={({ palette }) => palette.text.secondary} pb={1}>
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
      </Box>

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
              label={errors.recipient?.message || 'Recipient'}
              error={!!errors.recipient}
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
          label={errors.tokenAddress?.message || 'Select an asset'}
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
      </FormControl>

      <FormControl fullWidth>
        <TextField
          label={errors.amount?.message || 'Amount'}
          error={!!errors.amount}
          autoComplete="off"
          {...register('amount', { required: true, validate: validateAmount })}
        />
      </FormControl>

      <Button variant="contained" type="submit">
        Next
      </Button>
    </form>
  )
}

export default SendAssetsForm
