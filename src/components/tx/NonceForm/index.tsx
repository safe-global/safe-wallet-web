import { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { TextField, Tooltip } from '@mui/material'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import useSafeInfo from '@/hooks/useSafeInfo'
import InputValueHelper from '@/components/common/InputValueHelper'

type NonceFormProps = {
  name: string
  nonce: number
  recommendedNonce?: number
  readonly?: boolean
}

const NonceForm = ({ name, nonce, recommendedNonce, readonly }: NonceFormProps): ReactElement => {
  const { safe } = useSafeInfo()
  const safeNonce = safe.nonce || 0

  const { register, watch, setValue, trigger, formState } = useFormContext() || {}
  const currentNonce = watch(name)

  // Warn about a higher nonce
  const editableNonce = watch(name)
  const nonceWarning =
    recommendedNonce != null && editableNonce > recommendedNonce ? `Recommended nonce is ${recommendedNonce}` : ''

  const onResetNonce = () => {
    if (recommendedNonce) {
      setValue(name, recommendedNonce)
      trigger(name)
    }
  }

  return (
    <TextField
      type="number"
      autoComplete="off"
      defaultValue={nonce || ''}
      disabled={nonce == null || readonly}
      error={!!formState?.errors[name]}
      label={<>{formState?.errors[name]?.message || nonceWarning || 'Safe transaction nonce'}</>}
      InputProps={{
        endAdornment: !readonly && recommendedNonce !== undefined && recommendedNonce !== currentNonce && (
          <InputValueHelper onClick={onResetNonce}>
            <Tooltip title="Reset to recommended nonce">
              <RotateLeftIcon />
            </Tooltip>
          </InputValueHelper>
        ),
      }}
      // @see https://github.com/react-hook-form/react-hook-form/issues/220
      InputLabelProps={{
        shrink: currentNonce !== undefined,
      }}
      {...register(name, {
        required: true,
        valueAsNumber: true,
        validate: (val: number) => {
          if (!Number.isInteger(val)) {
            return 'Nonce must be an integer'
          } else if (val < safeNonce) {
            return `Nonce must be >= ${safeNonce}`
          }
        },
      })}
    />
  )
}

export default NonceForm
