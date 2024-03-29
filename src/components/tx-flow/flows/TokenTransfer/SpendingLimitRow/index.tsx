import { FormControl, FormControlLabel, InputLabel, Radio, RadioGroup, SvgIcon, Tooltip } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import classNames from 'classnames'
import { safeFormatUnits } from '@/utils/formatters'
import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { TokenTransferFields, TokenTransferType } from '@/components/tx-flow/flows/TokenTransfer'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import InfoIcon from '@/public/images/notifications/info.svg'
import ExternalLink from '@/components/common/ExternalLink'
import { HelpCenterArticle } from '@/config/constants'

import css from './styles.module.css'
import { TokenAmountFields } from '@/components/common/TokenAmountInput'
import { useContext } from 'react'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'

const SpendingLimitRow = ({
  availableAmount,
  selectedToken,
}: {
  availableAmount: bigint
  selectedToken: TokenInfo | undefined
}) => {
  const { control, trigger } = useFormContext()
  const isOnlySpendLimitBeneficiary = useIsOnlySpendingLimitBeneficiary()
  const { setNonceNeeded } = useContext(SafeTxContext)

  const formattedAmount = safeFormatUnits(availableAmount, selectedToken?.decimals)

  return (
    <FormControl>
      <InputLabel shrink required sx={{ backgroundColor: 'background.paper', px: '6px', mx: '-6px' }}>
        Send as
      </InputLabel>
      <Controller
        rules={{ required: true }}
        control={control}
        name={TokenTransferFields.type}
        render={({ field: { onChange, ...field } }) => (
          <RadioGroup
            row
            onChange={(e) => {
              onChange(e)

              setNonceNeeded(e.target.value === TokenTransferType.multiSig)

              // Validate only after the field is changed
              setTimeout(() => {
                trigger(TokenAmountFields.amount)
              }, 10)
            }}
            {...field}
            defaultValue={TokenTransferType.multiSig}
            className={css.group}
          >
            {!isOnlySpendLimitBeneficiary && (
              <FormControlLabel
                data-testid="standard-tx"
                value={TokenTransferType.multiSig}
                label={
                  <>
                    Standard transaction
                    <Tooltip
                      title={
                        <>
                          A standard transaction requires the signatures of other signers before the specified funds can
                          be transferred.&nbsp;
                          <ExternalLink
                            href={HelpCenterArticle.SPENDING_LIMITS}
                            title="Learn more about spending limits"
                          >
                            Learn more about spending limits
                          </ExternalLink>
                          .
                        </>
                      }
                      arrow
                      placement="top"
                    >
                      <span>
                        <SvgIcon
                          component={InfoIcon}
                          inheritViewBox
                          color="border"
                          fontSize="small"
                          sx={{
                            verticalAlign: 'middle',
                            ml: 0.5,
                          }}
                        />
                      </span>
                    </Tooltip>
                  </>
                }
                control={<Radio />}
                componentsProps={{ typography: { variant: 'body2' } }}
                className={css.label}
              />
            )}
            <FormControlLabel
              data-testid="spending-limit-tx"
              value={TokenTransferType.spendingLimit}
              label={
                <>
                  Spending limit <b>{`(${formattedAmount} ${selectedToken?.symbol})`}</b>
                  <Tooltip
                    title={
                      <>
                        A spending limit transaction allows you to transfer the specified funds without the need to
                        collect the signatures of other signers.&nbsp;
                        <ExternalLink href={HelpCenterArticle.SPENDING_LIMITS} title="Learn more about spending limits">
                          Learn more about spending limits
                        </ExternalLink>
                        .
                      </>
                    }
                    arrow
                    placement="top"
                  >
                    <span>
                      <SvgIcon
                        component={InfoIcon}
                        inheritViewBox
                        color="border"
                        fontSize="small"
                        sx={{
                          verticalAlign: 'middle',
                          ml: 0.5,
                        }}
                      />
                    </span>
                  </Tooltip>
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
