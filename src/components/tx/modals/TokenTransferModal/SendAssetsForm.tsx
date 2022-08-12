import { ReactElement } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  TextField,
  DialogContent,
} from '@mui/material'
import { type TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { TokenIcon } from '@/components/common/TokenAmount'
import { formatDecimals } from '@/utils/formatters'
import { validateTokenAmount } from '@/utils/validation'
import useBalances from '@/hooks/useBalances'
import AddressBookInput from '@/components/common/AddressBookInput'
import InputValueHelper from '@/components/common/InputValueHelper'
import SendFromBlock from '../../SendFromBlock'

export const AutocompleteItem = (item: { tokenInfo: TokenInfo; balance: string }): ReactElement => (
  <Grid container alignItems="center" gap={1}>
    <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />

    <Grid item xs>
      <Typography variant="body2">{item.tokenInfo.name}</Typography>

      <Typography variant="caption" component="p">
        {formatDecimals(item.balance, item.tokenInfo.decimals)} {item.tokenInfo.symbol}
      </Typography>
    </Grid>
  </Grid>
)

enum Field {
  recipient = 'recipient',
  tokenAddress = 'tokenAddress',
  amount = 'amount',
}

export type SendAssetsFormData = {
  [Field.recipient]: string
  [Field.tokenAddress]: string
  [Field.amount]: string
}

type SendAssetsFormProps = {
  formData?: SendAssetsFormData
  onSubmit: (formData: SendAssetsFormData) => void
}

const SendAssetsForm = ({ onSubmit, formData }: SendAssetsFormProps): ReactElement => {
  const { balances } = useBalances()

  const formMethods = useForm<SendAssetsFormData>({
    defaultValues: formData,
  })
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = formMethods

  // Selected token
  const tokenAddress = watch(Field.tokenAddress)
  const selectedToken = tokenAddress
    ? balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    : undefined

  const onMaxAmountClick = () => {
    if (!selectedToken) return
    setValue(Field.amount, formatDecimals(selectedToken.balance, selectedToken.tokenInfo.decimals))
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <SendFromBlock />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <AddressBookInput name={Field.recipient} label="Recipient" />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="asset-label">Select an asset</InputLabel>
            <Select
              labelId="asset-label"
              label={errors.tokenAddress?.message || 'Select an asset'}
              defaultValue={formData?.tokenAddress || ''}
              error={!!errors.tokenAddress}
              {...register(Field.tokenAddress, {
                required: true,
                onChange: () => setValue(Field.amount, ''),
              })}
            >
              {balances.items.map((item) => (
                <MenuItem key={item.tokenInfo.address} value={item.tokenInfo.address}>
                  <AutocompleteItem {...item} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <TextField
              label={errors.amount?.message || 'Amount'}
              error={!!errors.amount}
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <InputValueHelper onClick={onMaxAmountClick} disabled={!selectedToken}>
                    Max
                  </InputValueHelper>
                ),
              }}
              // @see https://github.com/react-hook-form/react-hook-form/issues/220
              InputLabelProps={{
                shrink: !!watch(Field.amount),
              }}
              {...register(Field.amount, {
                required: true,
                validate: (val) => validateTokenAmount(val, selectedToken),
              })}
            />
          </FormControl>
        </DialogContent>

        <Button variant="contained" type="submit">
          Next
        </Button>
      </form>
    </FormProvider>
  )
}

export default SendAssetsForm
