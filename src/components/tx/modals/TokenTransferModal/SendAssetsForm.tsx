import { ReactElement } from 'react'
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
} from '@mui/material'
import { type TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { formatUnits } from 'ethers/lib/utils'

import { TokenIcon } from '@/components/common/TokenAmount'
import { formatDecimals } from '@/utils/formatters'
import { validateAmount, validateTokenAmount } from '@/utils/validation'
import useBalances from '@/hooks/useBalances'
import AddressBookInput from '@/components/common/AddressBookInput'
import InputValueHelper from '@/components/common/InputValueHelper'
import SendFromBlock from '../../SendFromBlock'
import SpendingLimitRow from '@/components/tx/SpendingLimitRow'
import useSpendingLimit from '@/hooks/useSpendingLimit'

export const AutocompleteItem = (item: { tokenInfo: TokenInfo; balance: string }): ReactElement => (
  <Grid container alignItems="center" gap={1}>
    <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />

    <Grid item xs>
      <Typography variant="body2">{item.tokenInfo.name}</Typography>

      <Typography variant="caption" component="p">
        {formatDecimals(item.balance, item.tokenInfo.decimals)} {item.tokenInfo.symbol}
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
}

export type SendAssetsFormData = {
  [SendAssetsField.recipient]: string
  [SendAssetsField.tokenAddress]: string
  [SendAssetsField.amount]: string
  [SendAssetsField.type]: SendTxType
}

type SendAssetsFormProps = {
  formData?: SendAssetsFormData
  onSubmit: (formData: SendAssetsFormData) => void
}

const SendAssetsForm = ({ onSubmit, formData }: SendAssetsFormProps): ReactElement => {
  const { balances } = useBalances()

  const formMethods = useForm<SendAssetsFormData>({
    defaultValues: { ...formData, [SendAssetsField.type]: SendTxType.multiSig },
  })
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = formMethods

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

    const amount = spendingLimit && isSpendingLimitType ? spendingLimit.amount : selectedToken.balance
    setValue(SendAssetsField.amount, formatUnits(amount, selectedToken.tokenInfo.decimals))
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <SendFromBlock />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <AddressBookInput name={SendAssetsField.recipient} label="Recipient" />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="asset-label">Select an asset</InputLabel>
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
              {...register(SendAssetsField.amount, {
                required: true,
                validate: (val) =>
                  isSpendingLimitType
                    ? validateAmount(val, selectedToken?.tokenInfo.decimals, spendingLimit?.amount)
                    : validateTokenAmount(val, selectedToken),
              })}
            />
          </FormControl>
        </DialogContent>

        <Button variant="contained" type="submit">
          Next
        </Button>
      </form>
    </FormProvider>
  )
}

export default SendAssetsForm
