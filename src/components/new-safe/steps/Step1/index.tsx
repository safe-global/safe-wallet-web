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
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useForm } from 'react-hook-form'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import InfoIcon from '@/public/images/notifications/info.svg'
import NetworkSelector from '@/components/common/NetworkSelector'
import type { StepRenderProps } from '../../CardStepper/useCardStepper'
import type { NewSafeFormData } from '../../CreateSafe'
import useIsConnected from '@/hooks/useIsConnected'
import useSetCreationStep from '@/components/new-safe/CreateSafe/useSetCreationStep'

import css from './styles.module.css'
import layoutCss from '@/components/new-safe/CreateSafe/styles.module.css'

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
  setStep,
  setSafeName,
}: StepRenderProps<NewSafeFormData> & { setSafeName: (name: string) => void }) {
  const fallbackName = useMnemonicSafeName()
  const isConnected = useIsConnected()
  useSetCreationStep(setStep, isConnected)

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

  const onFormSubmit = (data: Pick<NewSafeFormData, 'name'>) => {
    const name = data.name || fallbackName
    setSafeName(name)
    onSubmit({ ...data, name })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} id={STEP_1_FORM_ID}>
      <Box className={layoutCss.row}>
        <Grid container spacing={1}>
          <Grid item xs={12} md={8}>
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
          </Grid>
          <Grid item>
            <Box className={css.select}>
              <NetworkSelector />
            </Box>
          </Grid>
        </Grid>
        <Typography variant="body2" mt={2}>
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
      </Box>
      <Divider />
      <Box className={layoutCss.row}>
        <Box display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onBack()}
            startIcon={<ArrowBackIcon fontSize="small" />}
          >
            Back
          </Button>
          <Button type="submit" variant="contained" size="stretched" disabled={!isConnected}>
            Next
          </Button>
        </Box>
      </Box>
    </form>
  )
}

export default CreateSafeStep1
