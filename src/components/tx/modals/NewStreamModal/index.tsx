import { Button, DialogContent, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import ModalDialog from '@/components/common/ModalDialog'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import SendFromBlock from '../../SendFromBlock'
import Identicon from '@/components/common/Identicon'
import NumberField from '@/components/common/NumberField'
import { AutocompleteItemForStream } from '../TokenTransferModal/SendAssetsForm'
import { validateDecimalLength } from '@/utils/validation'
import { useSafeUsers } from '@/hooks/useSafeUsers'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useTokenList } from '@/hooks/queries/useTokenList'
import { fetchStreamTransactions } from '@/hooks/queries/fetchStreamTransactions'
import { useRouter } from 'next/router'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'

export enum DurationType {
  year = 'year',
  month = 'month',
  day = 'day',
}

export enum NewStreamField {
  recipient = 'recipient',
  tokenSymbol = 'tokenSymbol',
  amount = 'amount',
  duration = 'duration',
}

export type NewStreamFormData = {
  [NewStreamField.recipient]: string
  [NewStreamField.tokenSymbol]: string
  [NewStreamField.amount]: string
  [NewStreamField.duration]: DurationType
}

const NewStreamModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { balances } = useVisibleBalances()
  const router = useRouter()
  const { data: tokens = [] } = useTokenList(balances)
  const formMethods = useForm<NewStreamFormData>({
    defaultValues: {
      [NewStreamField.recipient]: '',
      [NewStreamField.tokenSymbol]: '',
      [NewStreamField.amount]: '',
      [NewStreamField.duration]: DurationType.month,
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

  const tokenSymbol = watch(NewStreamField.tokenSymbol)
  const selectedToken = tokenSymbol
    ? (tokens || []).find((item) => item.symbol.toLowerCase() === tokenSymbol.toLowerCase())
    : undefined

  const safe = useSafeAddress()

  const users = useSafeUsers(safe)

  const onSubmit = async (values: NewStreamFormData) => {
    const selectedToken = (tokens || []).find((item) => item.symbol.toLowerCase() === values.tokenSymbol.toLowerCase())
    const txs = await fetchStreamTransactions(
      {
        address: selectedToken!.tokenAddress,
        symbol: selectedToken!.symbol,
        name: selectedToken!.name,
        decimals: selectedToken!.decimals,
        contract: {
          id: selectedToken!.llamaContractAddress,
        },
      },
      values.amount,
      values.recipient,
      values.duration,
    )

    router.push(`/multisend?safe=${router.query.safe}&${txs.map((tx) => `to=${tx.to}&data=${tx.data}`).join('&')}`)
  }

  return (
    <ModalDialog open={open} dialogTitle="Create stream" onClose={onClose}>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <SendFromBlock />

            <Controller
              name={NewStreamField.recipient}
              control={control}
              rules={{ required: true }}
              render={({ fieldState, field }) => (
                <FormControl fullWidth>
                  <InputLabel id="asset-label" required>
                    Select recipient
                  </InputLabel>
                  <Select
                    labelId="asset-label"
                    label={fieldState.error?.message || 'Select recipient'}
                    error={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                    }}
                  >
                    {users.map((user) => (
                      <MenuItem key={user.name} value={user.address}>
                        <Grid container alignItems="center" gap={1}>
                          <Identicon address={user.address} size={24} />

                          <Grid item xs>
                            <Typography variant="body2">{user.name}</Typography>

                            <Typography variant="caption" component="p">
                              {user.address}
                            </Typography>
                          </Grid>
                        </Grid>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name={NewStreamField.tokenSymbol}
              control={control}
              rules={{ required: true }}
              render={({ fieldState, field }) => (
                <FormControl fullWidth sx={{ mt: 2 }}>
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
                      resetField(NewStreamField.amount)
                    }}
                  >
                    {(tokens || []).map((item) => (
                      <MenuItem key={item.tokenAddress} value={item.symbol}>
                        <AutocompleteItemForStream {...item} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
              <NumberField
                label={errors.amount?.message || 'Amount'}
                error={!!errors.amount}
                // @see https://github.com/react-hook-form/react-hook-form/issues/220
                InputLabelProps={{
                  shrink: !!watch(NewStreamField.amount),
                }}
                required
                {...register(NewStreamField.amount, {
                  required: true,
                  validate: (val) => {
                    const decimals = selectedToken?.decimals
                    return validateDecimalLength(val, decimals)
                  },
                })}
              />
            </FormControl>

            <Controller
              name={NewStreamField.duration}
              control={control}
              rules={{ required: true }}
              render={({ fieldState, field }) => (
                <FormControl fullWidth sx={{ mt: 4 }}>
                  <InputLabel id="asset-label" required>
                    Arbitrary duration
                  </InputLabel>
                  <Select
                    labelId="asset-label"
                    label={fieldState.error?.message || 'Arbitrary duration'}
                    error={!!fieldState.error}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                    }}
                  >
                    {Object.values(DurationType).map((duration) => (
                      <MenuItem key={duration} value={duration}>
                        <Typography variant="body2">{duration}</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Button variant="contained" type="submit" sx={{ mt: 2 }}>
              Next
            </Button>
          </DialogContent>
        </form>
      </FormProvider>
    </ModalDialog>
  )
}

export default NewStreamModal
