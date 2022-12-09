import { FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { formatVisualAmount } from '@/utils/formatters'
import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { SpendingLimitState } from '@/store/spendingLimitsSlice'
import { SendAssetsField, SendTxType } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'

const SpendingLimitRow = ({
  spendingLimit,
  selectedToken,
}: {
  spendingLimit: SpendingLimitState
  selectedToken: TokenInfo | undefined
}) => {
  const { control } = useFormContext()

  const formattedAmount = formatVisualAmount(spendingLimit.amount, selectedToken?.decimals)

  return (
    <>
      <Typography>Send as</Typography>
      <FormControl sx={{ mb: 2 }}>
        <Controller
          rules={{ required: true }}
          control={control}
          name={SendAssetsField.type}
          render={({ field }) => (
            <RadioGroup {...field} defaultValue={SendTxType.multiSig}>
              <FormControlLabel
                value={SendTxType.multiSig}
                label="Multisig Transaction"
                control={<Radio />}
                componentsProps={{ typography: { variant: 'body2' } }}
              />
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
