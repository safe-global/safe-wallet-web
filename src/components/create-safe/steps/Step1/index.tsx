import {
  Card,
  LinearProgress,
  Select,
  InputAdornment,
  InputLabel,
  MenuItem,
  TextField,
  Tooltip,
  SvgIcon,
  Typography,
  Button,
  Link,
} from '@mui/material'
import { useForm } from 'react-hook-form'

import ChainIndicator from '@/components/common/ChainIndicator'
import useChainId from '@/hooks/useChainId'
import useChains from '@/hooks/useChains'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import InfoIcon from '@/public/images/notifications/info.svg'
import CreateSafeCardActions from '../../CardActions'
import CreateSafeCardContent from '../../CardContent'
import CreateSafeCardHeader from '../../CardHeader'

import css from './styles.module.css'

type CreateSafeStep1Form = {
  chainId: string
  name: string
}

enum CreateSafeStep1Fields {
  chainId = 'chainId',
  name = 'name',
}

const STEP_1_FORM_ID = 'create-safe-step-1-form'

const CreateSafeStep1 = () => {
  const chainId = useChainId()
  const { configs } = useChains()
  const fallbackName = useMnemonicSafeName()

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateSafeStep1Form>({
    mode: 'all',
    defaultValues: {
      [CreateSafeStep1Fields.chainId]: chainId || '',
      [CreateSafeStep1Fields.name]: '',
    },
  })

  const onSubmit = (data: CreateSafeStep1Form) => {
    console.log(data)
  }

  return (
    <Card className={css.card}>
      <LinearProgress />

      <CreateSafeCardHeader
        step={1}
        title="Select network and name Safe"
        subheader="Select the network on which to create your Safe"
      />

      <CreateSafeCardContent>
        <form onSubmit={handleSubmit(onSubmit)} id={STEP_1_FORM_ID} className={css.form}>
          <Select
            startAdornment={
              <InputAdornment position="start">
                <InputLabel required>Network</InputLabel>
              </InputAdornment>
            }
            {...(register(CreateSafeStep1Fields.chainId), { required: true })}
            SelectDisplayProps={{
              className: css.select,
            }}
            defaultValue={chainId}
          >
            {configs.map((chain) => (
              <MenuItem key={chain.chainId} value={chain.chainId}>
                <ChainIndicator chainId={chain.chainId} className={css.chain} />
              </MenuItem>
            ))}
          </Select>

          <TextField
            label={errors?.[CreateSafeStep1Fields.name]?.message || 'Name'}
            error={!!errors?.[CreateSafeStep1Fields.name]}
            required
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
            {...register(CreateSafeStep1Fields.name, { required: true })}
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
      </CreateSafeCardContent>

      <CreateSafeCardActions>
        <Button variant="contained" form={STEP_1_FORM_ID} type="submit">
          Continue
        </Button>
      </CreateSafeCardActions>
    </Card>
  )
}

export default CreateSafeStep1
