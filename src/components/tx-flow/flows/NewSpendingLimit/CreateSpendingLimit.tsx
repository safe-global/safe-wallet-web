import { useMemo } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Button, CardActions, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { defaultAbiCoder, parseUnits } from 'ethers/lib/utils'

import AddressBookInput from '@/components/common/AddressBookInput'
import useChainId from '@/hooks/useChainId'
import { getResetTimeOptions } from '@/components/transactions/TxDetails/TxData/SpendingLimits'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'
import type { NewSpendingLimitFlowProps } from '.'
import TxCard from '../../common/TxCard'
import css from '@/components/tx/ExecuteCheckbox/styles.module.css'
import TokenAmountInput, { TokenAmountFields } from '@/components/common/TokenAmountInput'
import { BigNumber } from '@ethersproject/bignumber'
import { safeFormatUnits } from '@/utils/formatters'
import { SpendingLimitFields } from '.'

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
  const { balances } = useVisibleBalances()

  const resetTimeOptions = useMemo(() => getResetTimeOptions(chainId), [chainId])

  const formMethods = useForm<NewSpendingLimitFlowProps>({
    defaultValues: params,
    mode: 'onChange',
  })

  const { handleSubmit, setValue, watch, control } = formMethods

  const tokenAddress = watch(TokenAmountFields.tokenAddress)
  const selectedToken = tokenAddress
    ? balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    : undefined

  const totalAmount = BigNumber.from(selectedToken?.balance || 0)

  const onMaxAmountClick = () => {
    if (!selectedToken) return

    const amount = selectedToken.balance

    setValue(TokenAmountFields.amount, safeFormatUnits(amount, selectedToken.tokenInfo.decimals), {
      shouldValidate: true,
    })
  }

  return (
    <TxCard>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <AddressBookInput name={SpendingLimitFields.beneficiary} label="Beneficiary" />
          </FormControl>

          <TokenAmountInput
            balances={balances.items}
            selectedToken={selectedToken}
            maxAmount={totalAmount}
            onMaxAmountClick={onMaxAmountClick}
          />

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
                <Select {...field} sx={{ textAlign: 'right', fontWeight: 700 }} IconComponent={ExpandMoreRoundedIcon}>
                  {resetTimeOptions.map((resetTime) => (
                    <MenuItem key={resetTime.value} value={resetTime.value} sx={{ overflow: 'hidden' }}>
                      {resetTime.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

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
