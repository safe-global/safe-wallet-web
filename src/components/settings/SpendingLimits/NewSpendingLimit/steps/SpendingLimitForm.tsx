import { useMemo, useState } from 'react'
import { FormProvider, useForm, Controller } from 'react-hook-form'
import {
  Button,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
} from '@mui/material'
import AddressBookInput from '@/components/common/AddressBookInput'
import { validateAmount, validateDecimalLength } from '@/utils/validation'
import { AutocompleteItem } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import useChainId from '@/hooks/useChainId'
import { getResetTimeOptions } from '@/components/transactions/TxDetails/TxData/SpendingLimits'
import { defaultAbiCoder } from '@ethersproject/abi'
import { parseUnits } from 'ethers/lib/utils'
import NumberField from '@/components/common/NumberField'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'

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

export const _validateSpendingLimit = (val: string, decimals?: number) => {
  // Allowance amount is uint96 https://github.com/safe-global/safe-modules/blob/master/allowances/contracts/AlowanceModule.sol#L52
  try {
    const amount = parseUnits(val, decimals)
    defaultAbiCoder.encode(['int96'], [amount])
  } catch (e) {
    return Number(val) > 1 ? 'Amount is too big' : 'Amount is too small'
  }
}

export const SpendingLimitForm = ({ data, onSubmit }: Props) => {
  const chainId = useChainId()
  const [showResetTime, setShowResetTime] = useState<boolean>(false)
  const { balances } = useVisibleBalances()

  const resetTimeOptions = useMemo(() => getResetTimeOptions(chainId), [chainId])

  const formMethods = useForm<NewSpendingLimitData>({
    defaultValues: { ...data, resetTime: '0' },
    mode: 'onChange',
  })
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = formMethods

  const tokenAddress = watch('tokenAddress')
  const selectedToken = tokenAddress
    ? balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    : undefined

  const toggleResetTime = () => {
    setValue('resetTime', showResetTime ? '0' : resetTimeOptions[0].value)
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
            <InputLabel id="asset-label" required>
              Select an asset
            </InputLabel>
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
            <NumberField
              label={errors.amount?.message || 'Amount'}
              error={!!errors.amount}
              required
              {...register('amount', {
                required: true,
                validate: (val) => {
                  const decimals = selectedToken?.tokenInfo.decimals
                  return (
                    validateAmount(val) ||
                    validateDecimalLength(val, decimals) ||
                    _validateSpendingLimit(val, selectedToken?.tokenInfo.decimals)
                  )
                },
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
                  <RadioGroup {...field} defaultValue={resetTimeOptions[0].value} name="radio-buttons-group">
                    {resetTimeOptions.map((resetTime) => (
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
