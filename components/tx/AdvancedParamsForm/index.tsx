import { Box, Button, FormControl, Grid, Paper, TextField, Typography } from '@mui/material'
import { BigNumber, BigNumberish } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useForm } from 'react-hook-form'
import css from './styles.module.css'

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

const GWEI = 'gwei'

const formatGwei = (value: BigNumberish): string => {
  try {
    return formatUnits(value, GWEI)
  } catch (err) {
    console.error('Error formatting price', err)
    return ''
  }
}

const parseGwei = (value: string): BigNumber | undefined => {
  try {
    return parseUnits(value, GWEI)
  } catch (err) {
    console.error('Error parsing price', err)
    return
  }
}

const AdvancedParamsForm = (props: AdvancedParamsFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      gasLimit: props.gasLimit.toString(),
      maxFeePerGas: formatGwei(props.maxFeePerGas),
      maxPriorityFeePerGas: formatGwei(props.maxPriorityFeePerGas),
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
      maxFeePerGas: parseGwei(data.maxFeePerGas) || props.maxFeePerGas,
      maxPriorityFeePerGas: parseGwei(data.maxPriorityFeePerGas) || props.maxPriorityFeePerGas,
    })
  }

  return (
    <Paper className={css.container} elevation={0}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6">Advanced parameters</Typography>

        <Grid container sx={{ marginTop: 4, marginBottom: 2, gap: 3 }}>
          <Grid item>
            <FormControl fullWidth>
              <TextField
                label={errors.gasLimit?.message || 'Gas limit'}
                error={!!errors.gasLimit}
                autoComplete="off"
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
                {...register('maxPriorityFeePerGas', { required: true })}
              />
            </FormControl>
          </Grid>

          <Grid item>
            <FormControl fullWidth>
              <TextField
                label={errors.maxFeePerGas?.message || 'Max fee (Gwei)'}
                error={!!errors.maxFeePerGas}
                autoComplete="off"
                {...register('maxFeePerGas', { required: true })}
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
