import type { ReactNode, SyntheticEvent } from 'react'
import InputAdornment, { type InputAdornmentProps } from '@mui/material/InputAdornment'
import Link from '@mui/material/Link'

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
