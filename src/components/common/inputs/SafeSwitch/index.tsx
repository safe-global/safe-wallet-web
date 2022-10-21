import { FormControl, FormControlLabel, Switch } from '@mui/material'
import type { FormControlLabelProps, SwitchProps } from '@mui/material'
import type { FieldValues } from 'react-hook-form'

import { useSafeController } from '../useSafeController'
import type { RHFInput } from '../types'

export const SafeSwitch = <TFieldValues extends FieldValues>(
  props: RHFInput<SwitchProps, TFieldValues> & { label?: FormControlLabelProps['label'] },
) => {
  const {
    field: { ref, value, ...field },
    error,
    required,
    label,
  } = useSafeController<TFieldValues>(props)

  const input = <Switch inputRef={ref} checked={value} {...props} {...field} />

  return (
    <FormControl required={required} error={!!error} disabled={props.disabled}>
      {label ? <FormControlLabel control={input} label={label} /> : input}
    </FormControl>
  )
}
