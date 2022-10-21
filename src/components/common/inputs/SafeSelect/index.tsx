import { FormControl, FormHelperText, InputLabel, Select } from '@mui/material'
import type { SelectProps, FormHelperTextProps } from '@mui/material'
import type { FieldValues } from 'react-hook-form'

import { useSafeController } from '../useSafeController'
import type { RHFInput } from '../types'

export const SafeSelect = <TFieldValues extends FieldValues>({
  fullWidth,
  helperText,
  ...props
}: RHFInput<SelectProps, TFieldValues> & { helperText?: FormHelperTextProps['children'] }) => {
  const {
    field: { ref, ...field },
    error,
    required,
    label,
  } = useSafeController<TFieldValues>(props)

  return (
    <FormControl required={required} error={!!error} disabled={props.disabled} fullWidth={fullWidth}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select error={!!error} required={required} inputRef={ref} {...props} {...field} />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
