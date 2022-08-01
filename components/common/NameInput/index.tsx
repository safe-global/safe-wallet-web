import { TextField, TextFieldProps } from '@mui/material'
import get from 'lodash/get'
import { FieldError, useFormContext } from 'react-hook-form'

const NameInput = ({
  name,
  textFieldProps,
}: {
  name: string
  textFieldProps: Omit<TextFieldProps, 'helperText' | 'error' | 'variant' | 'ref'>
}) => {
  const { register, formState } = useFormContext() || {}
  // the name can be a path: e.g. "owner.3.name"
  const fieldError = get(formState.errors, name) as FieldError | undefined

  return (
    <TextField
      {...textFieldProps}
      variant="outlined"
      error={Boolean(fieldError)}
      helperText={fieldError?.type === 'maxLength' ? 'Maximum 50 symbols' : fieldError?.message}
      fullWidth
      {...register(name, { maxLength: 50 })}
    />
  )
}

export default NameInput
