import type { ReactNode, SyntheticEvent } from 'react'
import { Link } from '@mui/material'

type InputValueHelperProps = {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}

const InputValueHelper = ({ children, onClick, disabled = false }: InputValueHelperProps) => {
  const handleClick = (e: SyntheticEvent) => {
    e.preventDefault()
    onClick()
  }

  return (
    <Link component="button" onClick={handleClick} sx={disabled ? { visibility: 'hidden' } : undefined}>
      {children}
    </Link>
  )
}

export default InputValueHelper
