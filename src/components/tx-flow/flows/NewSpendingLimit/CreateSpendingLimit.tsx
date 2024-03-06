import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { Button, CardActions, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { AbiCoder, parseUnits } from 'ethers'
import { useCallback, useMemo } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'

import AddressBookInput from '@/components/common/AddressBookInput'
import TokenAmountInput from '@/components/common/TokenAmountInput'
import { getResetTimeOptions } from '@/components/transactions/TxDetails/TxData/SpendingLimits'
import css from '@/components/tx/ExecuteCheckbox/styles.module.css'
import useChainId from '@/hooks/useChainId'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'
import { validateAmount, validateDecimalLength } from '@/utils/validation'
import type { NewSpendingLimitFlowProps } from '.'
import { SpendingLimitFields } from '.'
import TxCard from '../../common/TxCard'

export const _validateSpendingLimit = (val: string, decimals?: number) => {
  // Allowance amount is uint96 https://github.com/safe-global/safe-modules/blob/master/allowances/contracts/AlowanceModule.sol#L52
  try {
    const amount = parseUnits(val, decimals)
    AbiCoder.defaultAbiCoder().encode(['int96'], [amount])
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
  const { balances } = useVisibleBalances()

  const resetTimeOptions = useMemo(() => getResetTimeOptions(chainId), [chainId])

  const formMethods = useForm<NewSpendingLimitFlowProps>({
    defaultValues: params,
    mode: 'onChange',
  })

  const { handleSubmit, watch, control } = formMethods

  const tokenAddress = watch(SpendingLimitFields.tokenAddress)
  const selectedToken = tokenAddress
    ? balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    : undefined

  const validateSpendingLimit = useCallback(
    (value: string) => {
      return (
        validateAmount(value) ||
        validateDecimalLength(value, selectedToken?.tokenInfo.decimals) ||
        _validateSpendingLimit(value, selectedToken?.tokenInfo.decimals)
      )
    },
    [selectedToken?.tokenInfo.decimals],
  )

  return (
    <TxCard>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <AddressBookInput
              data-testid="beneficiary-section"
              name={SpendingLimitFields.beneficiary}
              label="Beneficiary"
            />
          </FormControl>

          <TokenAmountInput balances={balances.items} selectedToken={selectedToken} validate={validateSpendingLimit} />

          <Typography variant="h4" fontWeight={700} mt={3}>
            Reset Timer
          </Typography>
          <Typography>
            Set a reset time so the allowance automatically refills after the defined time period.
          </Typography>
          <FormControl fullWidth className={css.select}>
            <InputLabel shrink={false}>Time Period</InputLabel>
            <Controller
              rules={{ required: true }}
              control={control}
              name={SpendingLimitFields.resetTime}
              render={({ field }) => (
                <Select
                  data-testid="time-period-section"
                  {...field}
                  sx={{ textAlign: 'right', fontWeight: 700 }}
                  IconComponent={ExpandMoreRoundedIcon}
                >
                  {resetTimeOptions.map((resetTime) => (
                    <MenuItem
                      data-testid="time-period-item"
                      key={resetTime.value}
                      value={resetTime.value}
                      sx={{ overflow: 'hidden' }}
                    >
                      {resetTime.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <CardActions>
            <Button data-sid="80143" data-testid="next-btn" variant="contained" type="submit">
              Next
            </Button>
          </CardActions>
        </form>
      </FormProvider>
    </TxCard>
  )
}
