import { TextField, TextFieldProps } from '@mui/material'
import get from 'lodash/get'
import { FieldError, useFormContext, Validate } from 'react-hook-form'

const NameInput = ({
  name,
  validate,
  required = false,
  ...props
}: Omit<TextFieldProps, 'helperText' | 'error' | 'variant' | 'ref' | 'fullWidth'> & {
  name: string
  validate?: Validate<string>
  required?: boolean
}) => {
  const { register, formState } = useFormContext() || {}
  // the name can be a path: e.g. "owner.3.name"
  const fieldError = get(formState.errors, name) as FieldError | undefined

  return (
    <TextField
      {...props}
      variant="outlined"
      label={<>{fieldError?.type === 'maxLength' ? 'Maximum 50 symbols' : fieldError?.message || props.label}</>}
      error={Boolean(fieldError)}
      fullWidth
      {...register(name, { maxLength: 50, required })}
    />
  )
}

export default NameInput
