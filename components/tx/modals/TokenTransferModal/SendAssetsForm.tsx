import { ReactElement } from 'react'
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import { useForm } from 'react-hook-form'

import css from './styles.module.css'
import TokenAmount, { TokenIcon } from '@/components/common/TokenAmount'
import { formatDecimals } from '@/utils/formatters'
import { validateAddress, validateTokenAmount } from '@/utils/validation'
import useBalances from '@/hooks/useBalances'
import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeAddress from '@/hooks/useSafeAddress'
import TxModalTitle from '../../TxModalTitle'
import AddressBookInput from '@/components/common/AddressBookInput'
import { useCurrentChain } from '@/hooks/useChains'
import { parsePrefixedAddress } from '@/utils/addresses'

export type SendAssetsFormData = {
  recipient: string
  tokenAddress: string
  amount: string
}

type SendAssetsFormProps = {
  formData?: SendAssetsFormData
  onSubmit: (formData: SendAssetsFormData) => void
}

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

const SendAssetsForm = ({ onSubmit, formData }: SendAssetsFormProps): ReactElement => {
  const { balances } = useBalances()
  const currentChain = useCurrentChain()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SendAssetsFormData>({
    defaultValues: formData,
  })

  // Selected token
  const tokenAddress = getValues('tokenAddress')
  const selectedToken = tokenAddress
    ? balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    : undefined

  // On submit, pass an unprefixed address
  const onFormSubmit = (data: SendAssetsFormData) => {
    onSubmit({
      ...data,
      recipient: parsePrefixedAddress(data.recipient).address,
    })
  }

  return (
    <form className={css.container} onSubmit={handleSubmit(onFormSubmit)}>
      <TxModalTitle>Send funds</TxModalTitle>

      <SendFromBlock />

      <FormControl fullWidth>
        <AddressBookInput
          defaultValue={formData?.recipient}
          label="Recipient"
          error={errors.recipient}
          textFieldProps={{
            ...register('recipient', {
              validate: validateAddress(currentChain?.shortName),
              required: true,
            }),
          }}
        />
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
            <MenuItem value={item.tokenInfo.address} key={item.tokenInfo.address}>
              <TokenIcon logoUri={item.tokenInfo.logoUri} tokenSymbol={item.tokenInfo.symbol} />
              {item.tokenInfo.name} (<TokenAmount value={item.balance} decimals={item.tokenInfo.decimals} />)
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
  )
}

export default SendAssetsForm
