import { Button, DialogActions, FormControl, Grid, Paper, TextField } from '@mui/material'
import { BigNumber } from 'ethers'
import { FormProvider, useForm } from 'react-hook-form'
import { safeFormatUnits, safeParseUnits } from '@/utils/formatters'
import css from './styles.module.css'
import { FLOAT_REGEX } from '@/utils/validation'
import TxModalTitle from '../TxModalTitle'
import NonceForm from '../NonceForm'

export type AdvancedParameters = {
  nonce: number
  gasLimit: BigNumber | undefined
  maxFeePerGas: BigNumber
  maxPriorityFeePerGas: BigNumber
}

type AdvancedParamsFormProps = AdvancedParameters & {
  onSubmit: (params: AdvancedParameters) => void
  recommendedNonce?: number
  isExecution: boolean
  nonceReadonly?: boolean
}

type FormData = {
  nonce: number
  gasLimit: string | undefined
  maxFeePerGas: string
  maxPriorityFeePerGas: string
}

const AdvancedParamsForm = (props: AdvancedParamsFormProps) => {
  const formMethods = useForm<FormData>({
    defaultValues: {
      nonce: props.nonce,
      gasLimit: props.gasLimit ? props.gasLimit.toString() : undefined,
      maxFeePerGas: safeFormatUnits(props.maxFeePerGas),
      maxPriorityFeePerGas: safeFormatUnits(props.maxPriorityFeePerGas),
    },
  })
  const {
    register,
    handleSubmit,
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
                      label={errors.gasLimit?.message || 'Gas limit'}
                      error={!!errors.gasLimit}
                      autoComplete="off"
                      type="number"
                      {...register('gasLimit', { required: true })}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <TextField
                      label={errors.maxPriorityFeePerGas?.message || 'Max priority fee (Gwei)'}
                      error={!!errors.maxPriorityFeePerGas}
                      autoComplete="off"
                      {...register('maxPriorityFeePerGas', { required: true, pattern: FLOAT_REGEX })}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <TextField
                      label={errors.maxFeePerGas?.message || 'Max fee (Gwei)'}
                      error={!!errors.maxFeePerGas}
                      autoComplete="off"
                      {...register('maxFeePerGas', { required: true, pattern: FLOAT_REGEX })}
                    />
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>

          <DialogActions sx={{ paddingLeft: '0 !important', paddingRight: '0 !important' }}>
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
