import { TextField } from '@mui/material'
import { forwardRef } from 'react'
import type { TextFieldProps } from '@mui/material'
import type { ReactElement } from 'react'

export const _formatNumber = (value: string) => {
  value = value.trim()

  if (value === '') {
    return value
  }

  // Remove leading zeros from the string
  value = value.replace(/^0+/, '')

  if (value === '') {
    return '0'
  }

  // If the string starts with a decimal point, add a leading zero
  if (value.startsWith('.')) {
    value = '0' + value
  }

  return value
}

const NumberField = forwardRef<HTMLInputElement, TextFieldProps>(({ onChange, ...props }, ref): ReactElement => {
  return (
    <TextField
      autoComplete="off"
      ref={ref}
      onChange={(event) => {
        event.target.value = _formatNumber(event.target.value)
        return onChange?.(event)
      }}
      {...props}
      inputProps={{
        ...props.inputProps,
        // Autocomplete passes `onChange` in `inputProps`
        onChange: (event) => {
          // inputProps['onChange'] is generically typed
          if ('value' in event.target && typeof event.target.value === 'string') {
            event.target.value = _formatNumber(event.target.value)
            return props.inputProps?.onChange?.(event)
          }
        },
      }}
    />
  )
})

NumberField.displayName = 'NumberField'

export default NumberField
