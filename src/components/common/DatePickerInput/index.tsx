import { useFormContext, Controller } from 'react-hook-form'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import TextField from '@mui/material/TextField'
import { isFuture, isValid, startOfDay } from 'date-fns'

import inputCss from '@/styles/inputs.module.css'

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

          // Compare days using `startOfDay` to ignore timezone offset
          if (disableFuture && isFuture(startOfDay(val))) {
            return 'Date cannot be in the future'
          }

          return validate?.(val)
        },
      }}
      render={({ field, fieldState }) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            className={inputCss.input}
            label={label}
            inputFormat="dd/MM/yyyy"
            {...field}
            disableFuture={disableFuture}
            renderInput={({ label, ...params }) => (
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
