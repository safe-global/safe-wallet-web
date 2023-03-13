import { FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import type { BigNumber } from '@ethersproject/bignumber'
import { safeFormatUnits } from '@/utils/formatters'
import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { SendAssetsField, SendTxType } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'

const SpendingLimitRow = ({
  availableAmount,
  selectedToken,
}: {
  availableAmount: BigNumber
  selectedToken: TokenInfo | undefined
}) => {
  const { control, trigger } = useFormContext()
  const isOnlySpendLimitBeneficiary = useIsOnlySpendingLimitBeneficiary()

  const formattedAmount = safeFormatUnits(availableAmount, selectedToken?.decimals)

  return (
    <>
      <Typography>Send as</Typography>
      <FormControl>
        <Controller
          rules={{ required: true }}
          control={control}
          name={SendAssetsField.type}
          render={({ field: { onChange, ...field } }) => (
            <RadioGroup
              onChange={(e) => {
                onChange(e)

                // Validate only after the field is changed
                setTimeout(() => {
                  trigger(SendAssetsField.amount)
                }, 10)
              }}
              {...field}
              defaultValue={SendTxType.multiSig}
            >
              {!isOnlySpendLimitBeneficiary && (
                <FormControlLabel
                  value={SendTxType.multiSig}
                  label="Multisig transaction"
                  control={<Radio />}
                  componentsProps={{ typography: { variant: 'body2' } }}
                />
              )}
              <FormControlLabel
                value={SendTxType.spendingLimit}
                label={`Spending limit transaction (${formattedAmount} ${selectedToken?.symbol})`}
                control={<Radio />}
                componentsProps={{ typography: { variant: 'body2' } }}
              />
            </RadioGroup>
          )}
        />
      </FormControl>
    </>
  )
}

export default SpendingLimitRow
