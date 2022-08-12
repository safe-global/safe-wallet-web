import { useState } from 'react'
import { FormProvider, useForm, Controller } from 'react-hook-form'
import {
  Button,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
} from '@mui/material'
import AddressBookInput from '@/components/common/AddressBookInput'
import InputValueHelper from '@/components/common/InputValueHelper'
import { validateTokenAmount } from '@/utils/validation'
import useBalances from '@/hooks/useBalances'
import { formatDecimals } from '@/utils/formatters'
import { AutocompleteItem } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'

export const RESET_TIME_OPTIONS = [
  { label: '1 day', value: '1440' }, // 1 day x 24h x 60min
  { label: '1 week', value: '10080' }, // 7 days x 24h x 60min
  { label: '1 month', value: '43200' }, // 30 days x 24h x 60min
]

export type NewSpendingLimitData = {
  beneficiary: string
  tokenAddress: string
  amount: string
  resetTime: string
}

type Props = {
  data?: NewSpendingLimitData
  onSubmit: (data: NewSpendingLimitData) => void
}

export const SpendingLimitForm = ({ data, onSubmit }: Props) => {
  const [showResetTime, setShowResetTime] = useState<boolean>(false)
  const { balances } = useBalances()

  const formMethods = useForm<NewSpendingLimitData>({
    defaultValues: { ...data, resetTime: '0' },
  })
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    control,
    formState: { errors },
  } = formMethods

  const tokenAddress = watch('tokenAddress')
  const selectedToken = tokenAddress
    ? balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    : undefined

  const onMaxAmountClick = () => {
    if (!selectedToken) return
    setValue('amount', formatDecimals(selectedToken.balance, selectedToken.tokenInfo.decimals))
    trigger('amount')
  }

  const toggleResetTime = () => {
    setValue('resetTime', showResetTime ? '0' : RESET_TIME_OPTIONS[0].value)
    setShowResetTime((prev) => !prev)
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <AddressBookInput name="beneficiary" label="Beneficiary" />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="asset-label">Select an asset</InputLabel>
            <Select
              labelId="asset-label"
              label={errors.tokenAddress?.message || 'Select an asset'}
              defaultValue={data?.tokenAddress || ''}
              error={!!errors.tokenAddress}
              {...register('tokenAddress', {
                required: true,
                onChange: () => setValue('amount', ''),
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
                shrink: !!watch('amount'),
              }}
              {...register('amount', {
                required: true,
                validate: (val) => validateTokenAmount(val, selectedToken),
              })}
            />
          </FormControl>
          <Typography mt={2}>
            Set a reset time so the allowance automatically refills after the defined time period.
          </Typography>
          <FormControl fullWidth>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={showResetTime} onChange={toggleResetTime} />}
                label={`Reset time (${showResetTime ? 'choose reset time period' : 'one time'})`}
              />
            </FormGroup>
          </FormControl>
          {showResetTime && (
            <FormControl>
              <Controller
                rules={{ required: true }}
                control={control}
                name="resetTime"
                render={({ field }) => (
                  <RadioGroup {...field} defaultValue={RESET_TIME_OPTIONS[0].value} name="radio-buttons-group">
                    {RESET_TIME_OPTIONS.map((resetTime) => (
                      <FormControlLabel
                        key={resetTime.value}
                        value={resetTime.value}
                        label={resetTime.label}
                        control={<Radio />}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
            </FormControl>
          )}
        </DialogContent>

        <Button variant="contained" type="submit">
          Next
        </Button>
      </form>
    </FormProvider>
  )
}
