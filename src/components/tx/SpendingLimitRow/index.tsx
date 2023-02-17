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
              onChange={async (e) => {
                // Validate only after the field is changed
                await onChange(e)
                trigger(SendAssetsField.amount)
              }}
              {...field}
              defaultValue={SendTxType.multiSig}
            >
              {!isOnlySpendLimitBeneficiary && (
                <FormControlLabel
                  value={SendTxType.multiSig}
                  label="Multisig Transaction"
                  control={<Radio />}
                  componentsProps={{ typography: { variant: 'body2' } }}
                />
              )}
              <FormControlLabel
                value={SendTxType.spendingLimit}
                label={`Spending Limit Transaction (${formattedAmount} ${selectedToken?.symbol})`}
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
