import {
  Button,
  DialogTitle,
  DialogActions,
  FormControl,
  Grid,
  Paper,
  TextField,
  Link,
  Typography,
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { BigNumber } from 'ethers'
import { FormProvider, useForm } from 'react-hook-form'
import { safeFormatUnits, safeParseUnits } from '@/utils/formatters'
import css from './styles.module.css'
import { FLOAT_REGEX } from '@/utils/validation'
import NonceForm from '../NonceForm'
import InputValueHelper from '@/components/common/InputValueHelper'
import { BASE_TX_GAS } from '@/config/constants'
import useSafeInfo from '@/hooks/useSafeInfo'

enum AdvancedField {
  nonce = 'nonce',
  gasLimit = 'gasLimit',
  maxFeePerGas = 'maxFeePerGas',
  maxPriorityFeePerGas = 'maxPriorityFeePerGas',
  safeTxGas = 'safeTxGas',
}

export type AdvancedParameters = {
  [AdvancedField.nonce]: number
  [AdvancedField.gasLimit]?: BigNumber
  [AdvancedField.maxFeePerGas]?: BigNumber
  [AdvancedField.maxPriorityFeePerGas]?: BigNumber
  [AdvancedField.safeTxGas]?: number
}

type AdvancedParamsFormProps = AdvancedParameters & {
  onSubmit: (params: AdvancedParameters) => void
  recommendedNonce?: number
  estimatedGasLimit?: string
  isExecution: boolean
  nonceReadonly?: boolean
}

type FormData = {
  [AdvancedField.nonce]: number
  [AdvancedField.gasLimit]?: string
  [AdvancedField.maxFeePerGas]: string
  [AdvancedField.maxPriorityFeePerGas]: string
  [AdvancedField.safeTxGas]: number
}

const AdvancedParamsForm = (props: AdvancedParamsFormProps) => {
  const { safe } = useSafeInfo()

  const formMethods = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      nonce: props.nonce,
      gasLimit: props.gasLimit?.toString() || undefined,
      maxFeePerGas: props.maxFeePerGas ? safeFormatUnits(props.maxFeePerGas) : '',
      maxPriorityFeePerGas: props.maxPriorityFeePerGas ? safeFormatUnits(props.maxPriorityFeePerGas) : '',
      safeTxGas: props.safeTxGas,
    },
  })
  const {
    register,
    setValue,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = formMethods

  const onBack = () => {
    props.onSubmit({
      nonce: props.nonce,
      gasLimit: props.gasLimit,
      maxFeePerGas: props.maxFeePerGas,
      maxPriorityFeePerGas: props.maxPriorityFeePerGas,
      safeTxGas: props.safeTxGas,
    })
  }

  const onSubmit = (data: FormData) => {
    props.onSubmit({
      nonce: data.nonce,
      gasLimit: data.gasLimit ? BigNumber.from(data.gasLimit) : undefined,
      maxFeePerGas: safeParseUnits(data.maxFeePerGas) || props.maxFeePerGas,
      maxPriorityFeePerGas: safeParseUnits(data.maxPriorityFeePerGas) || props.maxPriorityFeePerGas,
      safeTxGas: data.safeTxGas || props.safeTxGas,
    })
  }

  const onResetGasLimit = () => {
    setValue(AdvancedField.gasLimit, props.estimatedGasLimit)
    trigger(AdvancedField.gasLimit)
  }

  const gasLimitError = errors.gasLimit
    ? errors.gasLimit.type === 'min'
      ? 'Gas limit must be at least 21000'
      : errors.gasLimit.message
    : undefined

  return (
    <Paper className={css.container} elevation={0}>
      <FormProvider {...formMethods}>
        <DialogTitle className={css.title}>Advanced parameters</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <NonceForm
                  name="nonce"
                  nonce={props.nonce}
                  recommendedNonce={props.recommendedNonce}
                  readonly={props.nonceReadonly}
                />
              </FormControl>
            </Grid>

            {!!props.safeTxGas && (
              <>
                <Grid item xs={6} />

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <TextField
                      label={errors.safeTxGas?.message || 'safeTxGas'}
                      error={!!errors.safeTxGas}
                      autoComplete="off"
                      type="number"
                      disabled={props.nonceReadonly}
                      {...register(AdvancedField.safeTxGas, { required: true, min: 0 })}
                    ></TextField>
                  </FormControl>
                </Grid>
              </>
            )}

            {props.isExecution && (
              <>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <TextField
                      label={gasLimitError || 'Gas limit'}
                      error={!!errors.gasLimit}
                      autoComplete="off"
                      InputProps={{
                        endAdornment: (
                          <InputValueHelper onClick={onResetGasLimit} disabled={!props.estimatedGasLimit}>
                            Recommended
                          </InputValueHelper>
                        ),
                      }}
                      // @see https://github.com/react-hook-form/react-hook-form/issues/220
                      InputLabelProps={{
                        shrink: watch(AdvancedField.gasLimit) !== undefined,
                      }}
                      type="number"
                      {...register(AdvancedField.gasLimit, { required: true, min: BASE_TX_GAS })}
                    ></TextField>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <TextField
                      label={errors.maxPriorityFeePerGas?.message || 'Max priority fee (Gwei)'}
                      error={!!errors.maxPriorityFeePerGas}
                      autoComplete="off"
                      {...register(AdvancedField.maxPriorityFeePerGas, {
                        required: true,
                        pattern: FLOAT_REGEX,
                        min: 0,
                      })}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <TextField
                      label={errors.maxFeePerGas?.message || 'Max fee (Gwei)'}
                      error={!!errors.maxFeePerGas}
                      autoComplete="off"
                      {...register(AdvancedField.maxFeePerGas, { required: true, pattern: FLOAT_REGEX, min: 0 })}
                    />
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>

          <Typography mt={2}>
            <Link href="https://help.gnosis-safe.io/en/articles/4738445-advanced-transaction-parameters">
              How can I configure these parameters manually?
              <OpenInNewIcon fontSize="small" sx={{ verticalAlign: 'middle', marginLeft: 0.5 }} />
            </Link>
          </Typography>

          <DialogActions className={css.actions}>
            <Button color="inherit" onClick={onBack}>
              Back
            </Button>

            <Button variant="contained" type="submit">
              Confirm
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Paper>
  )
}

export default AdvancedParamsForm
