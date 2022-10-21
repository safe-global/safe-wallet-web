import { FormControl, RadioGroup, FormLabel } from '@mui/material'
import type { RadioGroupProps, FormLabelProps } from '@mui/material'
import type { FieldValues } from 'react-hook-form'

import { useSafeController } from '../useSafeController'
import type { RHFInput } from '../types'

export const SafeRadioGroup = <TFieldValues extends FieldValues>(
  props: RHFInput<RadioGroupProps, TFieldValues> & { label?: FormLabelProps['children']; required?: boolean },
) => {
  const {
    field: { ref, ...field },
    error,
    required,
    label,
  } = useSafeController<TFieldValues>(props)

  return (
    <FormControl required={required} error={!!error}>
      {label && <FormLabel>{label}</FormLabel>}
      <RadioGroup {...props} {...field} />
    </FormControl>
  )
}
