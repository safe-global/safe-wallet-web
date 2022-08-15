import { Box, Button, Divider, FormControl, Grid, MenuItem, Paper, Select, Typography } from '@mui/material'
import { ReactElement } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import ChainIndicator from '@/components/common/ChainIndicator'
import useResetSafeCreation from '@/components/create-safe/useResetSafeCreation'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import useAddressBook from '@/hooks/useAddressBook'
import useWallet from '@/hooks/wallets/useWallet'
import { OwnerRow } from '@/components/create-safe/steps/OwnerRow'
import { NamedAddress, SafeFormData } from '@/components/create-safe/types'

type Props = {
  params: SafeFormData
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
  setStep: StepRenderProps['setStep']
}

const OwnerPolicyStep = ({ params, onSubmit, setStep, onBack }: Props): ReactElement => {
  useResetSafeCreation(setStep)
  const wallet = useWallet()
  const addressBook = useAddressBook()

  const defaultOwnerAddressBookName = wallet?.address && addressBook ? addressBook[wallet.address] : undefined

  const defaultOwner: NamedAddress = {
    name: defaultOwnerAddressBookName || wallet?.ens || '',
    address: wallet?.address || '',
  }

  const defaultThreshold = params.threshold || 1

  const formMethods = useForm<SafeFormData>({
    mode: 'onChange',
    defaultValues: {
      name: params.name,
      owners: params.owners ?? [defaultOwner],
      threshold: defaultThreshold,
    },
  })
  const { register, handleSubmit, control, formState } = formMethods

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'owners',
  })

  const addOwner = () => {
    append({ name: '', address: '' })
  }

  return (
    <Paper>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box padding={3}>
            <Typography mb={2}>
              Your Safe will have one or more owners. We have prefilled the first owner with your connected wallet
              details, but you are free to change this to a different owner.
            </Typography>
            <Typography>
              Add additional owners (e.g. wallets of your teammates) and specify how many of them have to confirm a
              transaction before it gets executed. In general, the more confirmations required, the more secure your
              Safe is. Learn about which Safe setup to use. The new Safe will ONLY be available on{' '}
              <ChainIndicator inline />
            </Typography>
          </Box>
          <Divider />
          <Grid container gap={3} flexWrap="nowrap" paddingX={3} paddingY={1}>
            <Grid item xs={12} md={4}>
              Name
            </Grid>
            <Grid item xs={12} md={7}>
              Address
            </Grid>
            <Grid item xs={1} />
          </Grid>
          <Divider />
          <Box padding={3}>
            {fields.map((field, index) => (
              <OwnerRow key={field.id} field={field} index={index} remove={remove} />
            ))}
            <Button onClick={addOwner} sx={{ fontWeight: 'normal' }}>
              + Add another owner
            </Button>
            <Typography marginTop={3} marginBottom={1}>
              Any transaction requires the confirmation of:
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <FormControl>
                <Select {...register('threshold')} defaultValue={defaultThreshold}>
                  {fields.map((field, index) => {
                    return (
                      <MenuItem key={field.id} value={index + 1}>
                        {index + 1}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
              <Typography>out of {fields.length} owner(s)</Typography>
            </Box>
            <Grid container alignItems="center" justifyContent="center" spacing={3}>
              <Grid item>
                <Button onClick={onBack}>Back</Button>
              </Grid>
              <Grid item>
                <Button variant="contained" type="submit" disabled={!formState.isValid}>
                  Continue
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </FormProvider>
    </Paper>
  )
}

export default OwnerPolicyStep
