import ChainIndicator from '@/components/common/ChainIndicator'
import NameInput from '@/components/common/NameInput'
import useSetCreationStep from '@/components/create-safe/useSetCreationStep'
import type { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import { Box, Button, Divider, FormControl, Grid, Paper, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import type { SafeFormData } from '@/components/create-safe/types'
import { trackEvent, CREATE_SAFE_EVENTS } from '@/services/analytics'
import ExternalLink from '@/components/common/ExternalLink'

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
  useSetCreationStep(setStep)
  const fallbackName = useMnemonicSafeName()

  const formMethods = useForm<SafeFormData>({
    defaultValues: {
      name: params?.name,
    },
    mode: 'onChange',
  })

  const { handleSubmit, getValues } = formMethods

  const onFormSubmit = handleSubmit((data: SafeFormData) => {
    onSubmit({
      ...data,
      name: data.name || fallbackName,
    })

    if (data.name) {
      trackEvent(CREATE_SAFE_EVENTS.NAME_SAFE)
    }
  })

  const onFormBack = () => {
    onBack({
      ...getValues(),
      name: getValues([FormField.name]) || fallbackName,
    })
  }

  return (
    <Paper>
      <FormProvider {...formMethods}>
        <form onSubmit={onFormSubmit}>
          <Box padding={3}>
            <Typography variant="body1" mb={2}>
              You are about to create a new Safe wallet with one or more owners. First, let&apos;s give your new wallet
              a name. This name is only stored locally and will never be shared with us or any third parties. The new
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
              By continuing you consent to the{' '}
              <ExternalLink href="https://safe.global/terms" fontWeight={700}>
                terms of use
              </ExternalLink>{' '}
              and{' '}
              <ExternalLink href="https://safe.global/privacy" fontWeight={700}>
                privacy policy
              </ExternalLink>
              .
            </Typography>
          </Box>

          <Divider />

          <Box padding={3}>
            <Grid container alignItems="center" justifyContent="center" spacing={3}>
              <Grid item>
                <Button onClick={onFormBack}>Back</Button>
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
