import { TextField } from '@mui/material'
import type { TextFieldProps } from '@mui/material'
import type { FieldValues } from 'react-hook-form'

import { useSafeController } from '../useSafeController'
import type { RHFInput } from '../types'

export const SafeTextField = <TFieldValues extends FieldValues>(props: RHFInput<TextFieldProps, TFieldValues>) => {
  const {
    field: { ref, ...field },
    error,
    required,
    label,
  } = useSafeController<TFieldValues>(props)

  return <TextField label={label} error={!!error} required={required} inputRef={ref} {...props} {...field} />
}
