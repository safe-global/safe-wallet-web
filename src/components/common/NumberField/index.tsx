import { TextField } from '@mui/material'
import { forwardRef } from 'react'
import type { TextFieldProps } from '@mui/material'
import type { ReactElement } from 'react'

const NumberField = forwardRef<HTMLInputElement, TextFieldProps>((props, ref): ReactElement => {
  return <TextField autoComplete="off" ref={ref} {...props} />
})

NumberField.displayName = 'NumberField'

export default NumberField
