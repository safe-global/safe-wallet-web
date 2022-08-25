import ChainIndicator from '@/components/common/ChainIndicator'
import NameInput from '@/components/common/NameInput'
import useResetSafeCreation from '@/components/create-safe/useResetSafeCreation'
import { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import { Box, Button, Divider, FormControl, Grid, Paper, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { SafeFormData } from '@/components/create-safe/types'
import { CREATE_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import { trackEvent } from '@/services/analytics/analytics'

type Props = {
  params: SafeFormData
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
  setStep: StepRenderProps['setStep']
}

enum FormField {
  address = 'address',
  name = 'name',
}

const SetNameStep = ({ params, onSubmit, onBack, setStep }: Props) => {
  useResetSafeCreation(setStep)
  const fallbackName = useMnemonicSafeName()

  const formMethods = useForm<SafeFormData>({
    defaultValues: {
      name: params?.name,
    },
    mode: 'onChange',
  })

  const { handleSubmit } = formMethods

  const onFormSubmit = handleSubmit((data: SafeFormData) => {
    onSubmit({
      ...data,
      name: data.name || fallbackName,
    })

    if (data.name) {
      trackEvent(CREATE_SAFE_EVENTS.NAME_SAFE)
    }
  })

  return (
    <Paper>
      <FormProvider {...formMethods}>
        <form onSubmit={onFormSubmit}>
          <Box padding={3}>
            <Typography variant="body1" mb={2}>
              You are about to create a new Safe wallet with one or more owners. First, let&apos;s give your new wallet
              a name. This name is only stored locally and will never be shared with Safe or any third parties. The new
              Safe will ONLY be available on <ChainIndicator inline />
            </Typography>

            <FormControl sx={{ width: '50%' }}>
              <NameInput
                name={FormField.name}
                label="Safe name"
                placeholder={fallbackName}
                InputLabelProps={{ shrink: true }}
              />
            </FormControl>

            <Typography mt={2}>
              By continuing you consent to the <a href="#">terms of use</a> and <a href="#">privacy policy</a>.
            </Typography>
          </Box>

          <Divider />

          <Box padding={3}>
            <Grid container alignItems="center" justifyContent="center" spacing={3}>
              <Grid item>
                <Button onClick={onBack}>Back</Button>
              </Grid>

              <Grid item>
                <Button variant="contained" type="submit">
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

export default SetNameStep
