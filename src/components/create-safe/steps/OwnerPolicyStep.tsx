import { Box, Button, Divider, FormControl, Grid, MenuItem, Paper, Select, Typography, SvgIcon } from '@mui/material'
import type { ReactElement } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import ChainIndicator from '@/components/common/ChainIndicator'
import useSetCreationStep from '@/components/create-safe/useSetCreationStep'
import type { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import useAddressBook from '@/hooks/useAddressBook'
import useWallet from '@/hooks/wallets/useWallet'
import { OwnerRow } from '@/components/create-safe/steps/OwnerRow'
import type { NamedAddress, SafeFormData } from '@/components/create-safe/types'
import { trackEvent, CREATE_SAFE_EVENTS } from '@/services/analytics'
import AddIcon from '@/public/images/common/add.svg'

type Props = {
  params: SafeFormData
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
  setStep: StepRenderProps['setStep']
}

enum FieldName {
  owners = 'owners',
  threshold = 'threshold',
}

const OwnerPolicyStep = ({ params, onSubmit, setStep, onBack }: Props): ReactElement => {
  useSetCreationStep(setStep)
  const wallet = useWallet()
  const addressBook = useAddressBook()

  const defaultOwnerAddressBookName = wallet?.address ? addressBook[wallet.address] : undefined

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
  const { register, handleSubmit, control, formState, watch, setValue, getValues } = formMethods
  const currentThreshold = watch(FieldName.threshold)
  const isValid = Object.keys(formState.errors).length === 0 // do not use formState.isValid because names can be empty

  const {
    fields: ownerFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: FieldName.owners,
  })
  const ownerLength = ownerFields.length

  const addOwner = () => {
    append({ name: '', address: '' })
  }

  const removeOwner = (index: number) => {
    remove(index)

    // Make sure the threshold is not higher than the number of owners
    if (currentThreshold >= ownerLength) {
      setValue<'threshold'>(FieldName.threshold, ownerLength - 1)
    }
  }

  const onFormSubmit = handleSubmit((data: SafeFormData) => {
    onSubmit(data)

    trackEvent({
      ...CREATE_SAFE_EVENTS.OWNERS,
      label: data.owners.length,
    })

    trackEvent({
      ...CREATE_SAFE_EVENTS.THRESHOLD,
      label: data.threshold,
    })
  })

  const onFormBack = () => {
    onBack(getValues())
  }

  return (
    <Paper>
      <FormProvider {...formMethods}>
        <form onSubmit={onFormSubmit}>
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
            {ownerFields.map((field, index) => (
              <OwnerRow key={field.id} index={index} groupName={FieldName.owners} remove={removeOwner} />
            ))}

            <Button
              onClick={addOwner}
              sx={{ fontWeight: 'normal' }}
              startIcon={<SvgIcon component={AddIcon} fontSize="small" inheritViewBox />}
            >
              Add another owner
            </Button>

            <Typography marginTop={3} marginBottom={1}>
              Any transaction requires the confirmation of:
            </Typography>

            <Box display="flex" alignItems="center" gap={2}>
              <FormControl>
                <Select {...register(FieldName.threshold, { valueAsNumber: true })} value={currentThreshold}>
                  {ownerFields.map((_, index) => (
                    <MenuItem key={index} value={index + 1}>
                      {index + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography>
                out of {ownerLength} owner{ownerLength > 1 && 's'}
              </Typography>
            </Box>

            <Grid container alignItems="center" justifyContent="center" spacing={3}>
              <Grid item>
                <Button onClick={onFormBack}>Back</Button>
              </Grid>

              <Grid item>
                <Button variant="contained" type="submit" disabled={!isValid}>
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
