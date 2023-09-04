import { FormControl, IconButton, Tooltip } from '@mui/material'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import { useFormContext } from 'react-hook-form'
import { BASE_TX_GAS } from '@/config/constants'
import { AdvancedField } from './types.d'
import NumberField from '@/components/common/NumberField'

const GasLimitInput = ({ recommendedGasLimit }: { recommendedGasLimit?: string }) => {
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext()

  const currentGasLimit = watch(AdvancedField.gasLimit)

  const onResetGasLimit = () => {
    setValue(AdvancedField.gasLimit, recommendedGasLimit)
    trigger(AdvancedField.gasLimit)
  }

  const error = errors.gasLimit as
    | {
        message: string
        type: string
      }
    | undefined

  const errorMessage = error ? (error.type === 'min' ? 'Gas limit must be at least 21000' : error.message) : undefined

  return (
    <FormControl fullWidth>
      <NumberField
        label={errorMessage || 'Gas limit'}
        error={!!errorMessage}
        InputProps={{
          endAdornment: recommendedGasLimit && recommendedGasLimit !== currentGasLimit.toString() && (
            <Tooltip title="Reset to recommended gas limit">
              <IconButton onClick={onResetGasLimit} size="small" color="primary">
                <RotateLeftIcon />
              </IconButton>
            </Tooltip>
          ),
        }}
        // @see https://github.com/react-hook-form/react-hook-form/issues/220
        InputLabelProps={{
          shrink: currentGasLimit !== undefined,
        }}
        required
        {...register(AdvancedField.gasLimit, { required: true, min: BASE_TX_GAS })}
      />
    </FormControl>
  )
}

export default GasLimitInput
