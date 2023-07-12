import { useCallback, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Box, Button, CardActions, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { defaultAbiCoder, parseUnits } from 'ethers/lib/utils'

import AddressBookInput from '@/components/common/AddressBookInput'
import useChainId from '@/hooks/useChainId'
import { getResetTimeOptions } from '@/components/transactions/TxDetails/TxData/SpendingLimits'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'
import type { NewSpendingLimitFlowProps } from '.'
import TxCard from '../../common/TxCard'
import css from '@/components/tx/ExecuteCheckbox/styles.module.css'
import TokenAmountInput from '@/components/common/TokenAmountInput'
import { SpendingLimitFields } from '.'
import { validateAmount, validateDecimalLength } from '@/utils/validation'
import AddressInputReadOnly from '@/components/common/AddressInputReadOnly'
import useAddressBook from '@/hooks/useAddressBook'

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
  const [recipientFocus, setRecipientFocus] = useState(!params.beneficiary)
  const chainId = useChainId()
  const { balances } = useVisibleBalances()
  const addressBook = useAddressBook()

  const resetTimeOptions = useMemo(() => getResetTimeOptions(chainId), [chainId])

  const formMethods = useForm<NewSpendingLimitFlowProps>({
    defaultValues: params,
    mode: 'onChange',
  })

  const { handleSubmit, setValue, watch, control } = formMethods

  const beneficiary = watch(SpendingLimitFields.beneficiary)
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
            {addressBook[beneficiary] ? (
              <Box
                onClick={() => {
                  setValue(SpendingLimitFields.beneficiary, '')
                  setRecipientFocus(true)
                }}
              >
                <AddressInputReadOnly label="Sending to" address={beneficiary} />
              </Box>
            ) : (
              <AddressBookInput name={SpendingLimitFields.beneficiary} label="Beneficiary" focused={recipientFocus} />
            )}
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
