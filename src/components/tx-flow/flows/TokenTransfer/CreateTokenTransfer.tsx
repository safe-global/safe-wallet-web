import { type ReactElement, useMemo, useState, useCallback } from 'react'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'
import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import useIsSafeTokenPaused from '@/components/tx/modals/TokenTransferModal/useIsSafeTokenPaused'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import { useAppSelector } from '@/store'
import { selectSpendingLimits } from '@/store/spendingLimitsSlice'
import useWallet from '@/hooks/wallets/useWallet'
import { FormProvider, useForm } from 'react-hook-form'
import classNames from 'classnames'
import useSpendingLimit from '@/hooks/useSpendingLimit'
import { BigNumber } from '@ethersproject/bignumber'
import { sameAddress } from '@/utils/addresses'
import {
  Box,
  Button,
  CardActions,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material'
import TokenIcon from '@/components/common/TokenIcon'
import AddressBookInput from '@/components/common/AddressBookInput'
import AddressInputReadOnly from '@/components/common/AddressInputReadOnly'
import InfoIcon from '@/public/images/notifications/info.svg'
import SpendingLimitRow from '@/components/tx/SpendingLimitRow'
import NumberField from '@/components/common/NumberField'
import { validateDecimalLength, validateLimitedAmount } from '@/utils/validation'
import { type TokenTransferParams, TokenTransferFields, TokenTransferType } from '.'
import TxCard from '../../common/TxCard'
import { formatVisualAmount, safeFormatUnits } from '@/utils/formatters'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import css from './styles.module.css'

const CreateTokenTransfer = ({
  params,
  onSubmit,
  txNonce,
}: {
  params: TokenTransferParams
  onSubmit: (data: TokenTransferParams) => void
  txNonce?: number
}): ReactElement => {
  const disableSpendingLimit = txNonce !== undefined
  const { balances } = useVisibleBalances()
  const addressBook = useAddressBook()
  const chainId = useChainId()
  const safeTokenAddress = getSafeTokenAddress(chainId)
  const isSafeTokenPaused = useIsSafeTokenPaused()
  const isOnlySpendingLimitBeneficiary = useIsOnlySpendingLimitBeneficiary()
  const spendingLimits = useAppSelector(selectSpendingLimits)
  const wallet = useWallet()
  const [recipientFocus, setRecipientFocus] = useState(false)

  const formMethods = useForm<TokenTransferParams>({
    defaultValues: {
      ...params,
      [TokenTransferFields.type]: disableSpendingLimit
        ? TokenTransferType.multiSig
        : isOnlySpendingLimitBeneficiary
        ? TokenTransferType.spendingLimit
        : params.type,
    },
    mode: 'onChange',
    delayError: 500,
  })

  const {
    register,
    handleSubmit,
    setValue,
    resetField,
    watch,
    formState: { errors },
  } = formMethods

  const recipient = watch(TokenTransferFields.recipient)

  // Selected token
  const tokenAddress = watch(TokenTransferFields.tokenAddress)
  const selectedToken = tokenAddress
    ? balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    : undefined

  const type = watch(TokenTransferFields.type)
  const spendingLimit = useSpendingLimit(selectedToken?.tokenInfo)
  const isSpendingLimitType = type === TokenTransferType.spendingLimit
  const spendingLimitAmount = spendingLimit ? BigNumber.from(spendingLimit.amount).sub(spendingLimit.spent) : undefined
  const totalAmount = BigNumber.from(selectedToken?.balance || 0)
  const maxAmount = isSpendingLimitType
    ? spendingLimitAmount && totalAmount.gt(spendingLimitAmount)
      ? spendingLimitAmount
      : totalAmount
    : totalAmount

  const balancesItems = useMemo(() => {
    return isOnlySpendingLimitBeneficiary
      ? balances.items.filter(({ tokenInfo }) => {
          return spendingLimits?.some(({ beneficiary, token }) => {
            return sameAddress(beneficiary, wallet?.address || '') && sameAddress(tokenInfo.address, token.address)
          })
        })
      : balances.items
  }, [balances.items, isOnlySpendingLimitBeneficiary, spendingLimits, wallet?.address])

  const onMaxAmountClick = useCallback(() => {
    if (!selectedToken) return

    const amount =
      isSpendingLimitType && spendingLimitAmount && spendingLimitAmount.lte(selectedToken.balance)
        ? spendingLimitAmount.toString()
        : selectedToken.balance

    setValue(TokenTransferFields.amount, safeFormatUnits(amount, selectedToken.tokenInfo.decimals), {
      shouldValidate: true,
    })
  }, [isSpendingLimitType, selectedToken, setValue, spendingLimitAmount])

  const isAmountError = !!errors[TokenTransferFields.tokenAddress] || !!errors[TokenTransferFields.amount]
  const isSafeTokenSelected = sameAddress(safeTokenAddress, tokenAddress)
  const isDisabled = isSafeTokenSelected && isSafeTokenPaused
  const isAddressValid = !!recipient && !errors[TokenTransferFields.recipient]

  return (
    <TxCard>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} className={commonCss.form}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            {addressBook[recipient] ? (
              <Box
                onClick={() => {
                  setValue(TokenTransferFields.recipient, '')
                  setRecipientFocus(true)
                }}
              >
                <AddressInputReadOnly label="Sending to" address={recipient} />
              </Box>
            ) : (
              <AddressBookInput
                name={TokenTransferFields.recipient}
                label="Sending to"
                canAdd={isAddressValid}
                focused={recipientFocus}
              />
            )}
          </FormControl>

          <FormControl className={classNames(css.outline, { [css.error]: isAmountError })} fullWidth>
            <InputLabel shrink required className={css.label}>
              {errors[TokenTransferFields.tokenAddress]?.message ||
                errors[TokenTransferFields.amount]?.message ||
                'Amount'}
            </InputLabel>
            <div className={css.inputs}>
              <NumberField
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  endAdornment: (
                    <Button className={css.max} onClick={onMaxAmountClick}>
                      MAX
                    </Button>
                  ),
                }}
                className={css.amount}
                required
                placeholder="0"
                {...register(TokenTransferFields.amount, {
                  required: true,
                  validate: (val) => {
                    const decimals = selectedToken?.tokenInfo.decimals
                    return (
                      validateLimitedAmount(val, decimals, maxAmount.toString()) || validateDecimalLength(val, decimals)
                    )
                  },
                })}
              />
              <Divider orientation="vertical" flexItem />
              <TextField
                select
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                }}
                className={css.select}
                {...register(TokenTransferFields.tokenAddress, {
                  required: true,
                  onChange: () => {
                    resetField(TokenTransferFields.amount)
                  },
                })}
                value={tokenAddress}
                required
              >
                {balancesItems.map((item) => (
                  <MenuItem key={item.tokenInfo.address} value={item.tokenInfo.address}>
                    <Grid container alignItems="center" gap={1}>
                      <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />

                      <Grid item xs>
                        <Typography variant="body2">{item.tokenInfo.name}</Typography>

                        <Typography variant="caption" component="p">
                          {formatVisualAmount(item.balance, item.tokenInfo.decimals)} {item.tokenInfo.symbol}
                        </Typography>
                      </Grid>
                    </Grid>
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </FormControl>

          {isDisabled && (
            <Box mt={1} display="flex" alignItems="center">
              <SvgIcon component={InfoIcon} color="error" fontSize="small" />
              <Typography variant="body2" color="error" ml={0.5}>
                $SAFE is currently non-transferable.
              </Typography>
            </Box>
          )}

          {!disableSpendingLimit && !!spendingLimitAmount && (
            <FormControl fullWidth sx={{ mt: 3 }}>
              <SpendingLimitRow availableAmount={spendingLimitAmount} selectedToken={selectedToken?.tokenInfo} />
            </FormControl>
          )}

          <Divider className={commonCss.nestedDivider} />

          <CardActions>
            <Button variant="contained" type="submit" disabled={isDisabled}>
              Next
            </Button>
          </CardActions>
        </form>
      </FormProvider>
    </TxCard>
  )
}

export default CreateTokenTransfer
