import { type SyntheticEvent } from 'react'
import { Button, DialogActions, FormControl, Grid, TextField, Link, Typography, DialogContent } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { BigNumber } from 'ethers'
import { FormProvider, useForm } from 'react-hook-form'
import { safeFormatUnits, safeParseUnits } from '@/utils/formatters'
import { FLOAT_REGEX } from '@/utils/validation'
import NonceForm from '../NonceForm'
import ModalDialog from '@/components/common/ModalDialog'
import { AdvancedField, type AdvancedParameters } from './types.d'
import GasLimitInput from './GasLimitInput'
import DatePickerInput from '@/components/common/DatePickerInput'

const HELP_LINK = 'https://help.gnosis-safe.io/en/articles/4738445-advanced-transaction-parameters'

type AdvancedParamsFormProps = {
  params: AdvancedParameters
  onSubmit: (params: AdvancedParameters) => void
  recommendedNonce?: number
  recommendedGasLimit?: AdvancedParameters['gasLimit']
  isExecution: boolean
  isEIP1559: boolean
  nonceReadonly?: boolean
}

type FormData = {
  [AdvancedField.nonce]: number
  [AdvancedField.userNonce]: number
  [AdvancedField.gasLimit]?: string
  [AdvancedField.maxFeePerGas]: string
  [AdvancedField.maxPriorityFeePerGas]: string
  [AdvancedField.safeTxGas]: number
  [AdvancedField.executableAfter]?: Date
}

const AdvancedParamsForm = ({ params, ...props }: AdvancedParamsFormProps) => {
  console.log(params)
  const formMethods = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      nonce: params.nonce,
      userNonce: params.userNonce || 0,
      gasLimit: params.gasLimit?.toString() || undefined,
      maxFeePerGas: params.maxFeePerGas ? safeFormatUnits(params.maxFeePerGas) : '',
      maxPriorityFeePerGas: params.maxPriorityFeePerGas ? safeFormatUnits(params.maxPriorityFeePerGas) : '',
      safeTxGas: params.safeTxGas,
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods

  const onBack = () => {
    props.onSubmit({
      nonce: params.nonce,
      userNonce: params.userNonce,
      gasLimit: params.gasLimit,
      maxFeePerGas: params.maxFeePerGas,
      maxPriorityFeePerGas: params.maxPriorityFeePerGas,
      safeTxGas: params.safeTxGas,
      executableAfter: params.executableAfter,
    })
  }

  const onSubmit = (data: FormData) => {
    props.onSubmit({
      nonce: data.nonce,
      userNonce: data.userNonce,
      gasLimit: data.gasLimit ? BigNumber.from(data.gasLimit) : undefined,
      maxFeePerGas: safeParseUnits(data.maxFeePerGas) || params.maxFeePerGas,
      maxPriorityFeePerGas: safeParseUnits(data.maxPriorityFeePerGas) || params.maxPriorityFeePerGas,
      safeTxGas: data.safeTxGas || params.safeTxGas,
      executableAfter: data.executableAfter?.getTime(),
    })
  }

  const onFormSubmit = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleSubmit(onSubmit)()
  }

  return (
    <ModalDialog open dialogTitle="Advanced parameters" hideChainIndicator>
      <FormProvider {...formMethods}>
        <form onSubmit={onFormSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1" fontWeight={700}>
                  Safe transaction
                </Typography>
              </Grid>

              {/* Safe nonce */}
              {params.nonce !== undefined && (
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <NonceForm
                      name={AdvancedField.nonce}
                      nonce={params.nonce}
                      recommendedNonce={props.recommendedNonce}
                      readonly={props.nonceReadonly}
                    />
                  </FormControl>
                </Grid>
              )}

              {/* Executable after */}
              {!props.nonceReadonly && (
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <DatePickerInput
                      disableFuture={false}
                      disablePast
                      label="Executable after"
                      {...register(AdvancedField.executableAfter, {
                        required: false,
                        valueAsDate: true,
                      })}
                    />
                  </FormControl>
                </Grid>
              )}

              {/* safeTxGas (< v1.3.0) */}
              {!!params.safeTxGas && (
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <TextField
                      label={errors.safeTxGas?.message || 'safeTxGas'}
                      error={!!errors.safeTxGas}
                      autoComplete="off"
                      type="number"
                      disabled={props.nonceReadonly}
                      required
                      {...register(AdvancedField.safeTxGas, { required: true, min: 0 })}
                    />
                  </FormControl>
                </Grid>
              )}

              {props.isExecution && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="body1" fontWeight={700}>
                      Owner transaction (Execution)
                    </Typography>
                  </Grid>

                  {/* User nonce */}
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <TextField
                        label={errors.userNonce?.message || 'Wallet nonce'}
                        error={!!errors.userNonce}
                        autoComplete="off"
                        type="number"
                        {...register(AdvancedField.userNonce)}
                      />
                    </FormControl>
                  </Grid>

                  {/* Gas limit */}
                  <Grid item xs={6}>
                    <GasLimitInput recommendedGasLimit={props.recommendedGasLimit?.toString()} />
                  </Grid>

                  {/* Gas price */}
                  {props.isEIP1559 && (
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <TextField
                          label={errors.maxPriorityFeePerGas?.message || 'Max priority fee (Gwei)'}
                          error={!!errors.maxPriorityFeePerGas}
                          autoComplete="off"
                          required
                          {...register(AdvancedField.maxPriorityFeePerGas, {
                            required: true,
                            pattern: FLOAT_REGEX,
                            min: 0,
                          })}
                        />
                      </FormControl>
                    </Grid>
                  )}

                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <TextField
                        label={errors.maxFeePerGas?.message || props.isEIP1559 ? 'Max fee (Gwei)' : 'Gas price (Gwei)'}
                        error={!!errors.maxFeePerGas}
                        autoComplete="off"
                        required
                        {...register(AdvancedField.maxFeePerGas, { required: true, pattern: FLOAT_REGEX, min: 0 })}
                      />
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>

            {/* Help link */}
            <Typography mt={2}>
              <Link href={HELP_LINK} target="_blank" rel="noreferrer">
                How can I configure these parameters manually?
                <OpenInNewIcon fontSize="small" sx={{ verticalAlign: 'middle', marginLeft: 0.5 }} />
              </Link>
            </Typography>
          </DialogContent>

          {/* Buttons */}
          <DialogActions>
            <Button color="inherit" onClick={onBack}>
              Back
            </Button>

            <Button variant="contained" type="submit">
              Confirm
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </ModalDialog>
  )
}

export default AdvancedParamsForm
