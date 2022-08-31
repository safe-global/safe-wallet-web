import { useFormContext, Controller, UseControllerProps } from 'react-hook-form'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import TextField from '@mui/material/TextField'
import type { DateValidationError } from '@mui/x-date-pickers/internals/hooks/validation/useDateValidation'

export const _getDateError = (reason: DateValidationError) => {
  switch (reason) {
    case 'invalidDate': {
      return 'Invalid date'
    }
    case 'shouldDisableDate': {
      return 'Cannot select chosen date'
    }
    case 'disableFuture': {
      return 'Date cannot be in the future'
    }
    case 'disablePast': {
      return 'Date cannot be in the past'
    }
    // 'minDate'/'maxDate' are errors from date-fns
    case 'minDate':
    case 'maxDate':
    default: {
      return undefined
    }
  }
}

const DatePickerInput = ({
  name,
  label,
  rules,
}: {
  name: string
  label: string
  rules?: UseControllerProps['rules']
}) => {
  const { control, setError } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={label}
            inputFormat="dd/MM/yyyy"
            {...field}
            disableFuture
            onError={(reason) => {
              const message = _getDateError(reason)
              if (message) {
                setError(field.name, {
                  type: reason as string,
                  message,
                })
              }
            }}
            renderInput={({ label, error, ...params }) => (
              <TextField
                label={fieldState.error?.message || label}
                {...params}
                fullWidth
                error={!!fieldState.error || error}
              />
            )}
          />
        </LocalizationProvider>
      )}
    />
  )
}

export default DatePickerInput
