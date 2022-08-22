import { FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { formatUnits } from '@ethersproject/units'
import useSpendingLimit from '@/hooks/useSpendingLimit'
import { TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'

const SpendingLimitRow = ({ selectedToken }: { selectedToken: TokenInfo | undefined }) => {
  const spendingLimit = useSpendingLimit(selectedToken)
  const { control } = useFormContext()

  if (!spendingLimit) return null

  const formattedAmount = formatUnits(spendingLimit.amount, selectedToken?.decimals)

  return (
    <>
      <Typography>Send as</Typography>
      <FormControl sx={{ mb: 2 }}>
        <Controller
          rules={{ required: true }}
          control={control}
          name="type"
          render={({ field }) => (
            <RadioGroup {...field} defaultValue="multiSig" name="type-button-group">
              <FormControlLabel
                value="multiSig"
                label="Multisig Transaction"
                control={<Radio />}
                componentsProps={{ typography: { variant: 'body2' } }}
              />
              <FormControlLabel
                value="spendingLimit"
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
