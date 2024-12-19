import type { ReactNode, SyntheticEvent } from 'react'
import { InputAdornment, Link } from '@mui/material'
import type { InputAdornmentProps } from '@mui/material'

type InputValueHelperProps = {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  position?: InputAdornmentProps['position']
}

const InputValueHelper = ({ children, onClick, disabled = false, position = 'end' }: InputValueHelperProps) => {
  const handleClick = (e: SyntheticEvent) => {
    e.preventDefault()
    onClick()
  }

  return (
    <InputAdornment position={position}>
      <Link type="button" component="button" onClick={handleClick} sx={disabled ? { visibility: 'hidden' } : undefined}>
        {children}
      </Link>
    </InputAdornment>
  )
}

export default InputValueHelper
