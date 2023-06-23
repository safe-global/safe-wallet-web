import { useState, useMemo } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Button,
  CardActions,
} from '@mui/material'
import { parseUnits, defaultAbiCoder } from 'ethers/lib/utils'

import AddressBookInput from '@/components/common/AddressBookInput'
import { validateAmount, validateDecimalLength } from '@/utils/validation'
import { AutocompleteItem } from '@/components/tx-flow/flows/TokenTransfer/CreateTokenTransfer'
import useChainId from '@/hooks/useChainId'
import { getResetTimeOptions } from '@/components/transactions/TxDetails/TxData/SpendingLimits'
import NumberField from '@/components/common/NumberField'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'
import type { NewSpendingLimitFlowProps } from '.'
import TxCard from '../../common/TxCard'

export const _validateSpendingLimit = (val: string, decimals?: number) => {
  // Allowance amount is uint96 https://github.com/safe-global/safe-modules/blob/master/allowances/contracts/AlowanceModule.sol#L52
  try {
    const amount = parseUnits(val, decimals)
    defaultAbiCoder.encode(['int96'], [amount])
  } catch (e) {
    return Number(val) > 1 ? 'Amount is too big' : 'Amount is too small'
  }
}

export const CreateSpendingLimit = ({
  params,
  onSubmit,
}: {
  params: NewSpendingLimitFlowProps
  onSubmit: (data: NewSpendingLimitFlowProps) => void
}) => {
  const chainId = useChainId()
  const [showResetTime, setShowResetTime] = useState<boolean>(params.resetTime !== '0')
  const { balances } = useVisibleBalances()

  const resetTimeOptions = useMemo(() => getResetTimeOptions(chainId), [chainId])
  const defaultResetTime = resetTimeOptions[0].value

  const formMethods = useForm<NewSpendingLimitFlowProps>({
    defaultValues: params,
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
    setValue('resetTime', showResetTime ? '0' : defaultResetTime)
    setShowResetTime((prev) => !prev)
  }

  return (
    <TxCard>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
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
              error={!!errors.tokenAddress}
              {...register('tokenAddress', {
                required: true,
                onChange: () => setValue('amount', ''),
              })}
              // TODO: Check when updating react-hook-form as `register` does not seem to return the value here
              value={tokenAddress}
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
                  <RadioGroup {...field}>
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

          <CardActions>
            <Button variant="contained" type="submit">
              Next
            </Button>
          </CardActions>
        </form>
      </FormProvider>
    </TxCard>
  )
}
