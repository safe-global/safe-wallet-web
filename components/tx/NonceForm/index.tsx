import { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { TextField } from '@mui/material'
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
  const safeNonce = safe?.nonce || 0

  const { register, watch, setValue, formState } = useFormContext() || {}

  // Warn about a higher nonce
  const editableNonce = watch(name)
  const nonceWarning =
    recommendedNonce != null && editableNonce > recommendedNonce ? `Recommended nonce is ${recommendedNonce}` : ''

  const onResetNonce = () => {
    if (recommendedNonce) {
      setValue('nonce', recommendedNonce)
    }
  }

  return (
    <TextField
      type="number"
      autoComplete="off"
      defaultValue={nonce || ''}
      disabled={nonce == null || readonly}
      error={!!formState?.errors[name]}
      label={<>{formState?.errors[name]?.message || nonceWarning || 'Nonce'}</>}
      InputProps={{
        endAdornment: (
          <InputValueHelper onClick={onResetNonce} disabled={!recommendedNonce}>
            Recommended
          </InputValueHelper>
        ),
      }}
      // @see https://github.com/react-hook-form/react-hook-form/issues/220
      InputLabelProps={{
        shrink: !!watch('nonce'),
      }}
      {...register(name, {
        required: true,
        valueAsNumber: true,
        validate: (val: number) => {
          if (!Number.isInteger(val)) {
            return 'Nonce must be an integer'
          } else if (val < safeNonce) {
            return `Nonce must be equal or greater than the current Safe nonce: ${safeNonce}`
          }
        },
      })}
    />
  )
}

export default NonceForm
