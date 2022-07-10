import { ReactElement } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, Typography, TextField } from '@mui/material'
import { type TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import css from './styles.module.css'
import TokenAmount, { TokenIcon } from '@/components/common/TokenAmount'
import { formatDecimals } from '@/utils/formatters'
import { validateTokenAmount } from '@/utils/validation'
import useBalances from '@/hooks/useBalances'
import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeAddress from '@/hooks/useSafeAddress'
import TxModalTitle from '../../TxModalTitle'
import AddressBookInput from '@/components/common/AddressBookInput'
import { parsePrefixedAddress } from '@/utils/addresses'

export const SendFromBlock = (): ReactElement => {
  const address = useSafeAddress()
  const { balances } = useBalances()
  const nativeToken = balances.items.find((item) => parseInt(item.tokenInfo.address, 16) === 0)
  const nativeTokenBalance = nativeToken ? formatDecimals(nativeToken.balance, nativeToken.tokenInfo.decimals) : '0'

  return (
    <Box sx={{ borderBottom: ({ palette }) => `1px solid ${palette.divider}` }} pb={2} mb={2}>
      <Typography color={({ palette }) => palette.text.secondary} pb={1}>
        Sending from
      </Typography>

      <Box>
        <EthHashInfo address={address} shortAddress={false} />
      </Box>

      {nativeToken && (
        <Box className={css.balance} bgcolor={(theme) => theme.palette.grey.A100}>
          Balance:{' '}
          <b>
            {nativeTokenBalance} {nativeToken.tokenInfo.symbol}
          </b>
        </Box>
      )}
    </Box>
  )
}

const AutocompleteItem = (item: { tokenInfo: TokenInfo; balance: string }): ReactElement => (
  <Grid container alignItems="center">
    <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />

    <Grid item xs>
      <Typography variant="body2" lineHeight={1.2}>
        {item.tokenInfo.name}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        <TokenAmount value={item.balance} decimals={item.tokenInfo.decimals} tokenSymbol={item.tokenInfo.symbol} />
      </Typography>
    </Grid>
  </Grid>
)

export type SendAssetsFormData = {
  recipient: string
  tokenAddress: string
  amount: string
}

type SendAssetsFormProps = {
  formData?: SendAssetsFormData
  onSubmit: (formData: SendAssetsFormData) => void
}

const SendAssetsForm = ({ onSubmit, formData }: SendAssetsFormProps): ReactElement => {
  const { balances } = useBalances()

  const formMethods = useForm<SendAssetsFormData>({
    defaultValues: formData,
  })
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = formMethods

  // Selected token
  const tokenAddress = watch('tokenAddress')
  const selectedToken = tokenAddress
    ? balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    : undefined

  const onFormSubmit = (data: SendAssetsFormData) => {
    onSubmit({
      ...data,
      recipient: parsePrefixedAddress(data.recipient).address,
    })
  }

  return (
    <FormProvider {...formMethods}>
      <form className={css.container} onSubmit={handleSubmit(onFormSubmit)}>
        <TxModalTitle>Send funds</TxModalTitle>

        <SendFromBlock />

        <FormControl fullWidth>
          <AddressBookInput name="recipient" />
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="asset-label">Select an asset</InputLabel>
          <Select
            labelId="asset-label"
            label={errors.tokenAddress?.message || 'Select an asset'}
            defaultValue={formData?.tokenAddress || ''}
            error={!!errors.tokenAddress}
            {...register('tokenAddress', { required: true })}
          >
            {balances.items.map((item) => (
              <MenuItem key={item.tokenInfo.address} value={item.tokenInfo.address}>
                <AutocompleteItem {...item} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <TextField
            label={errors.amount?.message || 'Amount'}
            error={!!errors.amount}
            autoComplete="off"
            {...register('amount', { required: true, validate: (val) => validateTokenAmount(val, selectedToken) })}
          />
        </FormControl>

        <Button variant="contained" type="submit">
          Next
        </Button>
      </form>
    </FormProvider>
  )
}

export default SendAssetsForm
