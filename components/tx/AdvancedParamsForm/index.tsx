import { Box, Button, FormControl, Grid, Paper, TextField } from '@mui/material'
import { BigNumber } from 'ethers'
import { useForm } from 'react-hook-form'
import { safeFormatUnits, safeParseUnits } from '@/utils/formatters'
import css from './styles.module.css'
import { FLOAT_REGEX } from '@/utils/validation'
import TxModalTitle from '../TxModalTitle'

export type AdvancedParameters = {
  gasLimit: number
  maxFeePerGas: BigNumber
  maxPriorityFeePerGas: BigNumber
}

type AdvancedParamsFormProps = AdvancedParameters & {
  onSubmit: (params: AdvancedParameters) => void
}

type FormData = {
  gasLimit: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
}

const AdvancedParamsForm = (props: AdvancedParamsFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      gasLimit: props.gasLimit.toString(),
      maxFeePerGas: safeFormatUnits(props.maxFeePerGas),
      maxPriorityFeePerGas: safeFormatUnits(props.maxPriorityFeePerGas),
    },
  })

  const onBack = () => {
    props.onSubmit({
      gasLimit: props.gasLimit,
      maxFeePerGas: props.maxFeePerGas,
      maxPriorityFeePerGas: props.maxPriorityFeePerGas,
    })
  }

  const onSubmit = (data: FormData) => {
    props.onSubmit({
      gasLimit: parseInt(data.gasLimit),
      maxFeePerGas: safeParseUnits(data.maxFeePerGas) || props.maxFeePerGas,
      maxPriorityFeePerGas: safeParseUnits(data.maxPriorityFeePerGas) || props.maxPriorityFeePerGas,
    })
  }

  return (
    <Paper className={css.container} elevation={0}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TxModalTitle>Advanced parameters</TxModalTitle>

        <Grid container sx={{ marginTop: 4, marginBottom: 2, gap: 3 }}>
          <Grid item>
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

          <Grid item xs={6} />

          <Grid item>
            <FormControl fullWidth>
              <TextField
                label={errors.maxPriorityFeePerGas?.message || 'Max priority fee (Gwei)'}
                error={!!errors.maxPriorityFeePerGas}
                autoComplete="off"
                {...register('maxPriorityFeePerGas', { required: true, pattern: FLOAT_REGEX })}
              />
            </FormControl>
          </Grid>

          <Grid item>
            <FormControl fullWidth>
              <TextField
                label={errors.maxFeePerGas?.message || 'Max fee (Gwei)'}
                error={!!errors.maxFeePerGas}
                autoComplete="off"
                {...register('maxFeePerGas', { required: true, pattern: FLOAT_REGEX })}
              />
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button color="inherit" onClick={onBack} sx={{ mr: 1 }}>
            Back
          </Button>

          <Box sx={{ flex: '1 1 auto' }} />

          <Button variant="contained" type="submit">
            Confirm
          </Button>
        </Box>
      </form>
    </Paper>
  )
}

export default AdvancedParamsForm
