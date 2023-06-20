import { FormControl, FormControlLabel, InputLabel, Radio, RadioGroup } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import type { BigNumber } from '@ethersproject/bignumber'
import classNames from 'classnames'
import { safeFormatUnits } from '@/utils/formatters'
import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { SendAssetsField, SendTxType } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'

import css from './styles.module.css'

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
    <FormControl>
      <InputLabel shrink required sx={{ backgroundColor: 'background.paper', px: '6px', mx: '-6px' }}>
        Send as
      </InputLabel>
      <Controller
        rules={{ required: true }}
        control={control}
        name={SendAssetsField.type}
        render={({ field: { onChange, ...field } }) => (
          <RadioGroup
            row
            onChange={(e) => {
              onChange(e)

              // Validate only after the field is changed
              setTimeout(() => {
                trigger(SendAssetsField.amount)
              }, 10)
            }}
            {...field}
            defaultValue={SendTxType.multiSig}
            className={css.group}
          >
            {!isOnlySpendLimitBeneficiary && (
              <FormControlLabel
                value={SendTxType.multiSig}
                // TODO: Add tooltip when we have the text
                label="Standard transaction"
                control={<Radio />}
                componentsProps={{ typography: { variant: 'body2' } }}
                className={css.label}
              />
            )}
            <FormControlLabel
              value={SendTxType.spendingLimit}
              // TODO: Add tooltip when we have the text
              label={
                <>
                  Spending limit <b>{`(${formattedAmount} ${selectedToken?.symbol})`}</b>
                </>
              }
              control={<Radio />}
              componentsProps={{ typography: { variant: 'body2' } }}
              className={classNames(css.label, { [css.spendingLimit]: !isOnlySpendLimitBeneficiary })}
            />
          </RadioGroup>
        )}
      />
    </FormControl>
  )
}

export default SpendingLimitRow
