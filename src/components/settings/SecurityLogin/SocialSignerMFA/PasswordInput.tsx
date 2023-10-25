import { useState } from 'react'
import { IconButton, TextField, type TextFieldProps } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useFormContext, type Validate } from 'react-hook-form'

const PasswordInput = ({
  name,
  validate,
  required = false,
  ...props
}: Omit<TextFieldProps, 'error' | 'variant' | 'ref' | 'fullWidth'> & {
  name: string
  validate?: Validate<string>
  required?: boolean
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const { register, formState } = useFormContext() || {}

  return (
    <TextField
      {...props}
      type={showPassword ? 'text' : 'password'}
      error={!!formState.errors[name]}
      InputProps={{
        endAdornment: (
          <IconButton
            aria-label="toggle password visibility"
            onClick={() => setShowPassword((prev) => !prev)}
            edge="end"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        ),
      }}
      {...register(name, {
        required,
        validate,
      })}
    />
  )
}

export default PasswordInput
