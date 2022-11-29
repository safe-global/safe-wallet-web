import { TextField } from '@mui/material'
import { useRef } from 'react'
import type { TextFieldProps } from '@mui/material'
import type { ReactElement } from 'react'

const NumberField = (props: TextFieldProps): ReactElement => {
  const inputRef = useRef<HTMLInputElement>()

  const handleBlur = () => {
    inputRef.current?.blur()
  }

  return <TextField type="number" autoComplete="off" inputRef={inputRef} onWheel={handleBlur} {...props} />
}

export default NumberField
