import { useFormContext, Controller } from 'react-hook-form'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import TextField from '@mui/material/TextField'
import isFuture from 'date-fns/isFuture'
import isValid from 'date-fns/isValid'

const DatePickerInput = ({
  name,
  label,
  deps,
  disableFuture = true,
  validate,
}: {
  name: string
  label: string
  deps?: string[]
  disableFuture?: boolean
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

          if (disableFuture && isFuture(val)) {
            return 'Date cannot be in the future'
          }

          return validate?.(val)
        },
      }}
      render={({ field, fieldState }) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={label}
            inputFormat="dd/MM/yyyy"
            {...field}
            disableFuture={disableFuture}
            renderInput={({ label, error: _, ...params }) => (
              <TextField label={fieldState.error?.message || label} {...params} fullWidth error={!!fieldState.error} />
            )}
          />
        </LocalizationProvider>
      )}
    />
  )
}

export default DatePickerInput
