import { type SyntheticEvent } from 'react'
import { Button, DialogActions, FormControl, Grid, Typography, DialogContent } from '@mui/material'
import { BigNumber } from 'ethers'
import { FormProvider, useForm } from 'react-hook-form'
import { safeFormatUnits, safeParseUnits } from '@/utils/formatters'
import { FLOAT_REGEX } from '@/utils/validation'
import NonceForm from '../NonceForm'
import ModalDialog from '@/components/common/ModalDialog'
import { AdvancedField, type AdvancedParameters } from './types.d'
import GasLimitInput from './GasLimitInput'
import ExternalLink from '@/components/common/ExternalLink'
import NumberField from '@/components/common/NumberField'
import { HelpCenterArticle } from '@/config/constants'

type AdvancedParamsFormProps = {
  params: AdvancedParameters
  onSubmit: (params: AdvancedParameters) => void
  recommendedNonce?: number
  recommendedGasLimit?: AdvancedParameters['gasLimit']
  isExecution: boolean
  isEIP1559: boolean
  nonceReadonly?: boolean
  willRelay?: boolean
}

type FormData = {
  [AdvancedField.nonce]: number
  [AdvancedField.userNonce]: number
  [AdvancedField.gasLimit]?: string
  [AdvancedField.maxFeePerGas]: string
  [AdvancedField.maxPriorityFeePerGas]: string
  [AdvancedField.safeTxGas]: number
}

const AdvancedParamsForm = ({ params, ...props }: AdvancedParamsFormProps) => {
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
              {(params.nonce !== undefined || !!params.safeTxGas) && (
                <Grid item xs={12}>
                  <Typography variant="body1" fontWeight={700}>
                    Safe Account transaction
                  </Typography>
                </Grid>
              )}

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

              {/* safeTxGas (< v1.3.0) */}
              {!!params.safeTxGas && (
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <NumberField
                      label={errors.safeTxGas?.message || 'safeTxGas'}
                      error={!!errors.safeTxGas}
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
                      <NumberField
                        disabled={props.willRelay}
                        label={errors.userNonce?.message || 'Wallet nonce'}
                        error={!!errors.userNonce}
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
                        <NumberField
                          disabled={props.willRelay}
                          label={errors.maxPriorityFeePerGas?.message || 'Max priority fee (Gwei)'}
                          error={!!errors.maxPriorityFeePerGas}
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
                      <NumberField
                        disabled={props.willRelay}
                        label={errors.maxFeePerGas?.message || props.isEIP1559 ? 'Max fee (Gwei)' : 'Gas price (Gwei)'}
                        error={!!errors.maxFeePerGas}
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
              <ExternalLink href={HelpCenterArticle.ADVANCED_PARAMS}>
                How can I configure these parameters manually?
              </ExternalLink>
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
