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
import NetworkSelector from '@/components/common/NetworkSelector'
import type { StepRenderProps } from '../../CardStepper/useCardStepper'
import type { NewSafeFormData } from '../../CreateSafe'
import useSetCreationStep from '@/components/new-safe/CreateSafe/useSetCreationStep'

import css from './styles.module.css'
import layoutCss from '@/components/new-safe/CreateSafe/styles.module.css'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import NetworkWarning from '@/components/new-safe/NetworkWarning'

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
  setStep,
  setSafeName,
}: StepRenderProps<NewSafeFormData> & { setSafeName: (name: string) => void }) {
  const fallbackName = useMnemonicSafeName()
  const isWrongChain = useIsWrongChain()
  useSetCreationStep(setStep)

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
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

  const isDisabled = isWrongChain || !isValid

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

        {isWrongChain && <NetworkWarning />}
      </Box>
      <Divider />
      <Box className={layoutCss.row}>
        <Box display="flex" flexDirection="row" justifyContent="flex-end" gap={3}>
          <Button type="submit" variant="contained" size="stretched" disabled={isDisabled}>
            Next
          </Button>
        </Box>
      </Box>
    </form>
  )
}

export default CreateSafeStep1
