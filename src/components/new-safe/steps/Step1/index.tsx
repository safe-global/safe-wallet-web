import {
  InputAdornment,
  TextField,
  Tooltip,
  SvgIcon,
  Typography,
  Link,
  Box,
  Divider,
  Button,
  Grid,
} from '@mui/material'
import { useForm } from 'react-hook-form'

import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import InfoIcon from '@/public/images/notifications/info.svg'

import css from './styles.module.css'
import NetworkSelector from '@/components/common/NetworkSelector'
import type { StepRenderProps } from '../../CardStepper/useCardStepper'
import type { NewSafeFormData } from '../../CreateSafe'

type CreateSafeStep1Form = {
  name: string
}

enum CreateSafeStep1Fields {
  name = 'name',
}

const STEP_1_FORM_ID = 'create-safe-step-1-form'

function CreateSafeStep1({
  data,
  onSubmit,
  onBack,
  setSafeName,
}: Pick<StepRenderProps<NewSafeFormData>, 'onSubmit' | 'data' | 'onBack'> & { setSafeName: (name: string) => void }) {
  const fallbackName = useMnemonicSafeName()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateSafeStep1Form>({
    mode: 'all',
    defaultValues: {
      [CreateSafeStep1Fields.name]: data.name,
    },
  })

  const onFormSubmit = (data: Partial<NewSafeFormData>) => {
    setSafeName(data.name ?? fallbackName)
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} id={STEP_1_FORM_ID} className={css.form}>
      <Grid container spacing={3}>
        <Grid item>
          <Box className={css.select}>
            <Typography color="text.secondary" pl={2}>
              Network
            </Typography>
            <Box className={css.networkSelect}>
              <NetworkSelector />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
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

          <Typography variant="body2" mt={3}>
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
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ ml: '-52px', mr: '-52px', mb: 4, mt: 3, alignSelf: 'normal' }} />
          <Box display="flex" flexDirection="row" gap={3}>
            <Button variant="outlined" onClick={() => onBack()}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Continue
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default CreateSafeStep1
