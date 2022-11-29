import { TextField } from '@mui/material'
import { forwardRef } from 'react'
import type { TextFieldProps } from '@mui/material'
import type { ReactElement } from 'react'

const NumberField = forwardRef<HTMLInputElement, TextFieldProps>(({ inputProps, ...props }, ref): ReactElement => {
  return (
    <TextField
      ref={ref}
      autoComplete="off"
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', ...inputProps }}
      {...props}
    />
  )
})

NumberField.displayName = 'NumberField'

export default NumberField
