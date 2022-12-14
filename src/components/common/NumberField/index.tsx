import { TextField } from '@mui/material'
import { forwardRef, useRef } from 'react'
import type { TextFieldProps } from '@mui/material'
import type { ReactElement } from 'react'

// `useForm` must have `shouldUseNativeValidation` set to `true` when using `NumberField` or there will be value/label collision.
// We can alternatively reference`inputRef.current?.validity.valid` / `inputRef.current?.validationMessages` but it does not take
// other RHF options (e.g. `delayError`) into account.

const NumberField = forwardRef<HTMLInputElement, TextFieldProps>(({ inputProps, ...props }, ref): ReactElement => {
  const inputRef = useRef<HTMLInputElement>()

  const handleBlur = () => {
    inputRef.current?.blur()
  }

  return (
    <TextField
      type="number"
      autoComplete="off"
      inputRef={inputRef}
      onWheel={handleBlur}
      ref={ref}
      inputProps={{
        step: 'any',
        ...inputProps,
      }}
      {...props}
    />
  )
})

NumberField.displayName = 'NumberField'

export default NumberField
