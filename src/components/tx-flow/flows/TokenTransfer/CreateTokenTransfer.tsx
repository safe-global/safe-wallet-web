import { type ReactElement, useMemo } from 'react'
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
import useSpendingLimit from '@/hooks/useSpendingLimit'
import { BigNumber } from '@ethersproject/bignumber'
import { sameAddress } from '@/utils/addresses'
import TokenIcon from '@/components/common/TokenIcon'
import {
  Box,
  Button,
  CardActions,
  FormControl,
  InputLabel,
  MenuItem,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material'
import SendFromBlock from '@/components/tx/SendFromBlock'
import SendToBlock from '@/components/tx/SendToBlock'
import AddressBookInput from '@/components/common/AddressBookInput'
import InfoIcon from '@/public/images/notifications/info.svg'
import SpendingLimitRow from '@/components/tx/SpendingLimitRow'
import NumberField from '@/components/common/NumberField'
import { validateDecimalLength, validateLimitedAmount } from '@/utils/validation'
import { type TokenTransferParams, TokenTransferFields, TokenTransferType } from '.'
import TxCard from '../../common/TxCard'

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

  const isAmountError = !!errors[TokenTransferFields.tokenAddress] || !!errors[TokenTransferFields.amount]
  const isSafeTokenSelected = sameAddress(safeTokenAddress, tokenAddress)
  const isDisabled = isSafeTokenSelected && isSafeTokenPaused

  return (
    <TxCard>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <SendFromBlock />

          <FormControl fullWidth sx={{ mt: 1 }}>
            {addressBook[recipient] ? (
              <Box onClick={() => setValue(TokenTransferFields.recipient, '')}>
                <SendToBlock address={recipient} />
              </Box>
            ) : (
              <AddressBookInput name={TokenTransferFields.recipient} label="Recipient" />
            )}
          </FormControl>

          <FormControl
            className={css.outline}
            fullWidth
            sx={{
              mt: 3,
              borderColor: isAmountError ? 'error.main' : 'border.main',
            }}
          >
            <InputLabel
              shrink
              required
              sx={{
                backgroundColor: 'background.paper',
                px: '6px',
                mx: '-6px',
                color: isAmountError ? 'error.main' : undefined,
              }}
            >
              {errors[TokenTransferFields.tokenAddress]?.message ||
                errors[TokenTransferFields.amount]?.message ||
                'Amount'}
            </InputLabel>
            <div className={css.inputs}>
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
                    <div className={css.item}>
                      <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />
                      <Typography>
                        <b>{item.tokenInfo.symbol}</b>
                      </Typography>
                    </div>
                  </MenuItem>
                ))}
              </TextField>
              <NumberField
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                }}
                className={css.amount}
                required
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
