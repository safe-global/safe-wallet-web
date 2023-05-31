import { TokenTransferStepper } from '@/components/TxFlow/TokenTransfer/index'
import { type ReactElement, useCallback, useContext, useMemo } from 'react'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'
import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import useIsSafeTokenPaused from '@/components/tx/modals/TokenTransferModal/useIsSafeTokenPaused'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import { useAppSelector } from '@/store'
import { selectSpendingLimits } from '@/store/spendingLimitsSlice'
import useWallet from '@/hooks/wallets/useWallet'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import useSpendingLimit from '@/hooks/useSpendingLimit'
import { BigNumber } from '@ethersproject/bignumber'
import { sameAddress } from '@/utils/addresses'
import { safeFormatUnits } from '@/utils/formatters'
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SvgIcon,
  Typography,
} from '@mui/material'
import SendFromBlock from '@/components/tx/SendFromBlock'
import SendToBlock from '@/components/tx/SendToBlock'
import AddressBookInput from '@/components/common/AddressBookInput'
import InfoIcon from '@/public/images/notifications/info.svg'
import SpendingLimitRow from '@/components/tx/SpendingLimitRow'
import NumberField from '@/components/common/NumberField'
import InputValueHelper from '@/components/common/InputValueHelper'
import { validateDecimalLength, validateLimitedAmount } from '@/utils/validation'
import {
  AutocompleteItem,
  SendAssetsField,
  type SendAssetsFormData,
  SendTxType,
} from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import { createTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '../SafeTxProvider'

const CreateTokenTransfer = ({ txNonce }: { txNonce?: number }): ReactElement => {
  const disableSpendingLimit = txNonce !== undefined
  const { mergedValues, onSubmit, onBack } = useContext(TokenTransferStepper.Context)
  const { balances } = useVisibleBalances()
  const addressBook = useAddressBook()
  const chainId = useChainId()
  const safeTokenAddress = getSafeTokenAddress(chainId)
  const isSafeTokenPaused = useIsSafeTokenPaused()
  const isOnlySpendingLimitBeneficiary = useIsOnlySpendingLimitBeneficiary()
  const spendingLimits = useAppSelector(selectSpendingLimits)
  const wallet = useWallet()
  const { setSafeTx, setSafeTxError, setNonce } = useContext(SafeTxContext)

  const formMethods = useForm<SendAssetsFormData>({
    defaultValues: {
      [SendAssetsField.recipient]: mergedValues?.[SendAssetsField.recipient] || '',
      [SendAssetsField.tokenAddress]: mergedValues?.[SendAssetsField.tokenAddress] || '',
      [SendAssetsField.amount]: mergedValues?.[SendAssetsField.amount] || '',
      [SendAssetsField.type]: disableSpendingLimit
        ? SendTxType.multiSig
        : isOnlySpendingLimitBeneficiary
        ? SendTxType.spendingLimit
        : mergedValues?.[SendAssetsField.type] || SendTxType.multiSig,
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
    control,
  } = formMethods

  const recipient = watch(SendAssetsField.recipient)

  // Selected token
  const tokenAddress = watch(SendAssetsField.tokenAddress)
  const selectedToken = tokenAddress
    ? balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    : undefined

  const type = watch(SendAssetsField.type)
  const spendingLimit = useSpendingLimit(selectedToken?.tokenInfo)
  const isSpendingLimitType = type === SendTxType.spendingLimit
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

    setValue(SendAssetsField.amount, safeFormatUnits(amount, selectedToken.tokenInfo.decimals), {
      shouldValidate: true,
    })
  }, [isSpendingLimitType, selectedToken, setValue, spendingLimitAmount])

  const isSafeTokenSelected = sameAddress(safeTokenAddress, tokenAddress)
  const isDisabled = isSafeTokenSelected && isSafeTokenPaused

  // Create SafeTx on submit and pass it to the SafeTxContext
  const onFormSubmit = handleSubmit((formData) => {
    if (!selectedToken) return

    const txParams = createTokenTransferParams(
      formData.recipient,
      formData.amount,
      selectedToken.tokenInfo.decimals,
      selectedToken.tokenInfo.address,
    )

    // Set the nonce passed from outside (replacement tx)
    setNonce(txNonce)

    createTx(txParams, txNonce)
      .then(setSafeTx)
      .then(() => {
        onSubmit(formData)
      })
      .catch(setSafeTxError)
  })

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onFormSubmit}>
        <DialogContent>
          <SendFromBlock />

          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            {addressBook[recipient] ? (
              <Box onClick={() => setValue(SendAssetsField.recipient, '')}>
                <SendToBlock address={recipient} />
              </Box>
            ) : (
              <AddressBookInput name={SendAssetsField.recipient} label="Recipient" />
            )}
          </FormControl>

          <Controller
            name={SendAssetsField.tokenAddress}
            control={control}
            rules={{ required: true }}
            render={({ fieldState, field }) => (
              <FormControl fullWidth>
                <InputLabel id="asset-label" required>
                  Select an asset
                </InputLabel>
                <Select
                  labelId="asset-label"
                  label={fieldState.error?.message || 'Select an asset'}
                  error={!!fieldState.error}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    resetField(SendAssetsField.amount)
                  }}
                >
                  {balancesItems.map((item) => (
                    <MenuItem key={item.tokenInfo.address} value={item.tokenInfo.address}>
                      <AutocompleteItem {...item} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          {isDisabled && (
            <Box mt={1} display="flex" alignItems="center">
              <SvgIcon component={InfoIcon} color="error" fontSize="small" />
              <Typography variant="body2" color="error" ml={0.5}>
                $SAFE is currently non-transferable.
              </Typography>
            </Box>
          )}

          {!disableSpendingLimit && !!spendingLimitAmount && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <SpendingLimitRow availableAmount={spendingLimitAmount} selectedToken={selectedToken?.tokenInfo} />
            </FormControl>
          )}

          <FormControl fullWidth sx={{ mt: 2 }}>
            <NumberField
              label={errors.amount?.message || 'Amount'}
              error={!!errors.amount}
              InputProps={{
                endAdornment: (
                  <InputValueHelper onClick={onMaxAmountClick} disabled={!selectedToken}>
                    Max
                  </InputValueHelper>
                ),
              }}
              // @see https://github.com/react-hook-form/react-hook-form/issues/220
              InputLabelProps={{
                shrink: !!watch(SendAssetsField.amount),
              }}
              required
              {...register(SendAssetsField.amount, {
                required: true,
                validate: (val) => {
                  const decimals = selectedToken?.tokenInfo.decimals
                  return (
                    validateLimitedAmount(val, decimals, maxAmount.toString()) || validateDecimalLength(val, decimals)
                  )
                },
              })}
            />
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
          <Button variant="contained" type="submit" disabled={isDisabled}>
            Next
          </Button>
        </DialogActions>
      </form>
    </FormProvider>
  )
}

export default CreateTokenTransfer
