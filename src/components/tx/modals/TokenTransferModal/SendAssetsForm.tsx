import type { ReactElement } from 'react'
import { useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  TextField,
  DialogContent,
  Box,
} from '@mui/material'
import { type TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import TokenIcon from '@/components/common/TokenIcon'
import css from './styles.module.css'
import { formatVisualAmount, safeFormatUnits } from '@/utils/formatters'
import { validateDecimalLength, validateLimitedAmount } from '@/utils/validation'
import useBalances from '@/hooks/useBalances'
import AddressBookInput from '@/components/common/AddressBookInput'
import InputValueHelper from '@/components/common/InputValueHelper'
import SendFromBlock from '../../SendFromBlock'
import SpendingLimitRow from '@/components/tx/SpendingLimitRow'
import useSpendingLimit from '@/hooks/useSpendingLimit'
import EthHashInfo from '@/components/common/EthHashInfo'
import useAddressBook from '@/hooks/useAddressBook'
import { SANCTIONED_ADDRESSES, SANCTIONED_ADDRESS_MESSAGE } from '@/utils/ofac-sanctioned-addresses'

export const AutocompleteItem = (item: { tokenInfo: TokenInfo; balance: string }): ReactElement => (
  <Grid container alignItems="center" gap={1}>
    <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />

    <Grid item xs>
      <Typography variant="body2">{item.tokenInfo.name}</Typography>

      <Typography variant="caption" component="p">
        {formatVisualAmount(item.balance, item.tokenInfo.decimals)} {item.tokenInfo.symbol}
      </Typography>
    </Grid>
  </Grid>
)

export enum SendTxType {
  multiSig = 'multiSig',
  spendingLimit = 'spendingLimit',
}

export enum SendAssetsField {
  recipient = 'recipient',
  tokenAddress = 'tokenAddress',
  amount = 'amount',
  type = 'type',
  OFAC = 'OFAC',
}

export type SendAssetsFormData = {
  [SendAssetsField.recipient]: string
  [SendAssetsField.tokenAddress]: string
  [SendAssetsField.amount]: string
  [SendAssetsField.type]: SendTxType
  [SendAssetsField.OFAC]: string
}

type SendAssetsFormProps = {
  formData?: SendAssetsFormData
  onSubmit: (formData: SendAssetsFormData) => void
}

const SendAssetsForm = ({ onSubmit, formData }: SendAssetsFormProps): ReactElement => {
  const { balances } = useBalances()
  const addressBook = useAddressBook()

  const formMethods = useForm<SendAssetsFormData>({
    defaultValues: { ...formData, [SendAssetsField.type]: SendTxType.multiSig },
    mode: 'onChange',
    delayError: 500,
  })
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
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

  const onMaxAmountClick = () => {
    if (!selectedToken) return

    const amount =
      spendingLimit && isSpendingLimitType
        ? Math.min(+spendingLimit.amount, +selectedToken.balance).toString()
        : selectedToken.balance

    setValue(SendAssetsField.amount, safeFormatUnits(amount, selectedToken.tokenInfo.decimals))
  }

  useEffect(() => {
    if (recipient && SANCTIONED_ADDRESSES.includes(recipient.toLowerCase())) {
      setError(SendAssetsField.OFAC, { message: SANCTIONED_ADDRESS_MESSAGE })
    } else {
      setError(SendAssetsField.OFAC, { message: '' })
    }
  }, [recipient, setError])

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <SendFromBlock />

          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            {addressBook[recipient] ? (
              <Box onClick={() => setValue(SendAssetsField.recipient, '')}>
                <EthHashInfo address={recipient} shortAddress={false} hasExplorer showCopyButton />
              </Box>
            ) : (
              <AddressBookInput name={SendAssetsField.recipient} label="Recipient" />
            )}
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="asset-label" required>
              Select an asset
            </InputLabel>
            <Select
              labelId="asset-label"
              label={errors.tokenAddress?.message || 'Select an asset'}
              defaultValue={formData?.tokenAddress || ''}
              error={!!errors.tokenAddress}
              {...register(SendAssetsField.tokenAddress, {
                required: true,
                onChange: () => setValue(SendAssetsField.amount, ''),
              })}
            >
              {balances.items.map((item) => (
                <MenuItem key={item.tokenInfo.address} value={item.tokenInfo.address}>
                  <AutocompleteItem {...item} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!!spendingLimit && (
            <SpendingLimitRow spendingLimit={spendingLimit} selectedToken={selectedToken?.tokenInfo} />
          )}

          <FormControl fullWidth>
            <TextField
              label={errors.amount?.message || 'Amount'}
              error={!!errors.amount}
              autoComplete="off"
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
                  const max = isSpendingLimitType ? spendingLimit?.amount : selectedToken?.balance
                  return validateLimitedAmount(val, decimals, max) || validateDecimalLength(val, decimals)
                },
              })}
            />
          </FormControl>
          {!!errors.OFAC && <p className={css.error}>{errors.OFAC.message}</p>}
        </DialogContent>

        <Button
          variant="contained"
          type="submit"
          disabled={Boolean(
            errors.amount?.message || errors.tokenAddress?.message || errors.type?.message || errors.OFAC?.message,
          )}
        >
          Next
        </Button>
      </form>
    </FormProvider>
  )
}

export default SendAssetsForm
