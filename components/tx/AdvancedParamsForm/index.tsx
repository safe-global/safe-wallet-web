import { Button, DialogActions, FormControl, Grid, Paper, TextField } from '@mui/material'
import { BigNumber } from 'ethers'
import { FormProvider, useForm } from 'react-hook-form'
import { safeFormatUnits, safeParseUnits } from '@/utils/formatters'
import css from './styles.module.css'
import { FLOAT_REGEX } from '@/utils/validation'
import TxModalTitle from '../TxModalTitle'
import NonceForm from '../NonceForm'
import InputValueHelper from '@/components/common/InputValueHelper'
import { BASE_TX_GAS } from '@/config/constants'

export type AdvancedParameters = {
  nonce: number
  gasLimit?: BigNumber
  maxFeePerGas?: BigNumber
  maxPriorityFeePerGas?: BigNumber
}

type AdvancedParamsFormProps = AdvancedParameters & {
  onSubmit: (params: AdvancedParameters) => void
  recommendedNonce?: number
  estimatedGasLimit?: string
  isExecution: boolean
  nonceReadonly?: boolean
}

type FormData = {
  nonce: number
  gasLimit?: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
}

const AdvancedParamsForm = (props: AdvancedParamsFormProps) => {
  const formMethods = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      nonce: props.nonce,
      gasLimit: props.gasLimit ? props.gasLimit.toString() : undefined,
      maxFeePerGas: props.maxFeePerGas ? safeFormatUnits(props.maxFeePerGas) : '',
      maxPriorityFeePerGas: props.maxPriorityFeePerGas ? safeFormatUnits(props.maxPriorityFeePerGas) : '',
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
    })
  }

  const onSubmit = (data: FormData) => {
    props.onSubmit({
      nonce: data.nonce,
      gasLimit: data.gasLimit ? BigNumber.from(data.gasLimit) : undefined,
      maxFeePerGas: safeParseUnits(data.maxFeePerGas) || props.maxFeePerGas,
      maxPriorityFeePerGas: safeParseUnits(data.maxPriorityFeePerGas) || props.maxPriorityFeePerGas,
    })
  }

  const onResetGasLimit = () => {
    setValue('gasLimit', props.estimatedGasLimit)
    trigger('gasLimit')
  }

  const gasLimitError = errors.gasLimit
    ? errors.gasLimit.type === 'min'
      ? 'Gas limit must be at least 21000'
      : errors.gasLimit.message
    : undefined

  return (
    <Paper className={css.container} elevation={0}>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TxModalTitle>Advanced parameters</TxModalTitle>

          <Grid container my={4} spacing={2}>
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
                        shrink: !!watch('gasLimit'),
                      }}
                      type="number"
                      {...register('gasLimit', { required: true, min: BASE_TX_GAS })}
                    ></TextField>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <TextField
                      label={errors.maxPriorityFeePerGas?.message || 'Max priority fee (Gwei)'}
                      error={!!errors.maxPriorityFeePerGas}
                      autoComplete="off"
                      {...register('maxPriorityFeePerGas', { required: true, pattern: FLOAT_REGEX, min: 0 })}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <TextField
                      label={errors.maxFeePerGas?.message || 'Max fee (Gwei)'}
                      error={!!errors.maxFeePerGas}
                      autoComplete="off"
                      {...register('maxFeePerGas', { required: true, pattern: FLOAT_REGEX, min: 0 })}
                    />
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>

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
