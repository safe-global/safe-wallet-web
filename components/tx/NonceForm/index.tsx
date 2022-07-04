import { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { TextField } from '@mui/material'
import useSafeInfo from '@/hooks/useSafeInfo'

const NONCE_FIELD = 'nonce'

const NonceForm = ({ recommendedNonce, readonly }: { recommendedNonce: number; readonly?: boolean }): ReactElement => {
  const { safe } = useSafeInfo()
  const safeNonce = safe?.nonce || 0

  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<{ [NONCE_FIELD]: number }>()

  // Warn about a higher nonce
  const editableNonce = watch(NONCE_FIELD)
  const nonceWarning =
    recommendedNonce != null && editableNonce > recommendedNonce ? `Recommended nonce is ${recommendedNonce}` : ''

  return (
    <TextField
      type="number"
      autoComplete="off"
      key={recommendedNonce || ''}
      defaultValue={recommendedNonce || ''}
      disabled={recommendedNonce == null || readonly}
      error={!!errors[NONCE_FIELD]}
      label={errors[NONCE_FIELD]?.message || nonceWarning || 'Nonce'}
      {...register(NONCE_FIELD, {
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
