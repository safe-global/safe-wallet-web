import { useFormContext, Controller } from 'react-hook-form'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import TextField from '@mui/material/TextField'
import { isFuture, isPast, isValid, startOfDay } from 'date-fns'
import { DateTimePicker } from '@mui/x-date-pickers'

const DatePickerInput = ({
  name,
  label,
  deps,
  disableFuture = true,
  disablePast = false,
  validate,
}: {
  name: string
  label: string
  deps?: string[]
  disableFuture?: boolean
  disablePast?: boolean
  validate?: (value: Date | null) => string | undefined
}) => {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        deps,
        validate: (val) => {
          if (!val) {
            return
          }

          if (!isValid(val)) {
            return 'Invalid date'
          }

          // Compare days using `startOfDay` to ignore timezone offset
          if (disableFuture && isFuture(startOfDay(val))) {
            return 'Date cannot be in the future'
          }

          // Compare days using `startOfDay` to ignore timezone offset
          if (disablePast && isPast(val)) {
            return 'Date cannot be in the past'
          }

          return validate?.(val)
        },
      }}
      render={({ field, fieldState }) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label={label}
            inputFormat="dd/MM/yyyy hh:mm:ss"
            {...field}
            disableFuture={disableFuture}
            disablePast={disablePast}
            renderInput={({ label, error: _, ...params }) => (
              <TextField label={fieldState.error?.message || label} {...params} fullWidth error={!!fieldState.error} />
            )}
            PaperProps={{
              elevation: 2,
            }}
          />
        </LocalizationProvider>
      )}
    />
  )
}

export default DatePickerInput
