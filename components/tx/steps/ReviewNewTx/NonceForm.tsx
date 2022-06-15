import { ReactElement, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { FormControl, TextField } from '@mui/material'

const NONCE_FIELD = 'nonce'

type NonceFormProps = {
  recommendedNonce?: number
  safeNonce?: number
  onChange: (nonce: number) => void
}

const NonceForm = ({ recommendedNonce, safeNonce, onChange }: NonceFormProps): ReactElement => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<{ [NONCE_FIELD]: number }>({ mode: 'onChange' })

  const editableNonce = watch(NONCE_FIELD)

  // Warn about a higher nonce
  const nonceWarning =
    recommendedNonce != null && editableNonce > recommendedNonce
      ? `Your nonce is higher than the recommended one: ${recommendedNonce}`
      : ''

  useEffect(() => {
    onChange(editableNonce)
  }, [editableNonce, onChange])

  return (
    <FormControl fullWidth>
      <TextField
        label="Nonce"
        type="number"
        autoComplete="off"
        key={recommendedNonce || ''}
        defaultValue={recommendedNonce || ''}
        disabled={recommendedNonce == null}
        error={!!errors[NONCE_FIELD]}
        helperText={errors[NONCE_FIELD]?.message || nonceWarning || ' '}
        {...register(NONCE_FIELD, {
          required: true,
          valueAsNumber: true,
          validate: (val) => {
            if (!Number.isInteger(val)) {
              return 'Nonce must be an integer'
            } else if (val < (safeNonce || 0)) {
              return `Nonce must be equal or greater than the current Safe nonce: ${safeNonce || 0}`
            }
          },
        })}
      />
    </FormControl>
  )
}

export default NonceForm
