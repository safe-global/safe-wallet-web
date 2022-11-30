import type { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { IconButton, Tooltip } from '@mui/material'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import useSafeInfo from '@/hooks/useSafeInfo'
import NumberField from '@/components/common/NumberField'

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
    <NumberField
      defaultValue={nonce || ''}
      disabled={nonce == null || readonly}
      error={!!formState?.errors[name]}
      label={<>{formState?.errors[name]?.message || nonceWarning || 'Safe transaction nonce'}</>}
      InputProps={{
        endAdornment: !readonly && recommendedNonce !== undefined && recommendedNonce !== currentNonce && (
          <Tooltip title="Reset to recommended nonce">
            <IconButton onClick={onResetNonce} size="small" color="primary">
              <RotateLeftIcon />
            </IconButton>
          </Tooltip>
        ),
      }}
      // @see https://github.com/react-hook-form/react-hook-form/issues/220
      InputLabelProps={{
        shrink: currentNonce !== undefined,
      }}
      required
      {...register(name, {
        required: true,
        valueAsNumber: true,
        validate: (val: number) => {
          if (!Number.isInteger(val)) {
            return 'Nonce must be an integer'
          } else if (val < safeNonce) {
            return `Nonce can't be lower than ${safeNonce}`
          }
        },
      })}
    />
  )
}

export default NonceForm
