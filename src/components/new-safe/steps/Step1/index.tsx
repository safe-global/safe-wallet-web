import { InputAdornment, TextField, Tooltip, SvgIcon, Typography, Button, Link, Box } from '@mui/material'
import { useForm } from 'react-hook-form'

import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import InfoIcon from '@/public/images/notifications/info.svg'
import StepCard from '../../StepCard'

import css from './styles.module.css'
import NetworkSelector from '@/components/common/NetworkSelector'

type CreateSafeStep1Form = {
  name: string
}

enum CreateSafeStep1Fields {
  name = 'name',
}

const STEP_1_FORM_ID = 'create-safe-step-1-form'

const CreateSafeStep1 = () => {
  const fallbackName = useMnemonicSafeName()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateSafeStep1Form>({
    mode: 'all',
    defaultValues: {
      [CreateSafeStep1Fields.name]: '',
    },
  })

  const onSubmit = (data: CreateSafeStep1Form) => {
    console.log(data)
  }

  return (
    <StepCard
      title="Select network and name Safe"
      subheader="Select the network on which to create your Safe"
      content={
        <form onSubmit={handleSubmit(onSubmit)} id={STEP_1_FORM_ID} className={css.form}>
          <Box className={css.select}>
            <Typography color="text.secondary" pl={2}>
              Network
            </Typography>
            <Box className={css.networkSelect}>
              <NetworkSelector />
            </Box>
          </Box>

          <TextField
            fullWidth
            label={errors?.[CreateSafeStep1Fields.name]?.message || 'Name'}
            error={!!errors?.[CreateSafeStep1Fields.name]}
            placeholder={fallbackName}
            InputProps={{
              endAdornment: (
                <Tooltip
                  title="This name is stored locally and will never be shared with us or any third parties."
                  arrow
                  placement="top"
                >
                  <InputAdornment position="end">
                    <SvgIcon component={InfoIcon} inheritViewBox />
                  </InputAdornment>
                </Tooltip>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
            {...register(CreateSafeStep1Fields.name)}
          />

          <Typography variant="body2">
            By continuing, you agree to our{' '}
            <Link href="https://gnosis-safe.io/terms" target="_blank" rel="noopener noreferrer" fontWeight={700}>
              terms of use
            </Link>{' '}
            and{' '}
            <Link href="https://gnosis-safe.io/privacy" target="_blank" rel="noopener noreferrer" fontWeight={700}>
              privacy policy
            </Link>
            .
          </Typography>
        </form>
      }
      actions={
        <Button variant="contained" form={STEP_1_FORM_ID} type="submit">
          Continue
        </Button>
      }
    />
  )
}

export default CreateSafeStep1
