import type { ReactNode, SyntheticEvent } from 'react'
import { Link } from '@mui/material'

type InputValueHelperProps = {
  children: ReactNode
  onMouseDown: () => void
  disabled?: boolean
}

const InputValueHelper = ({
  children,
  // We use onMouseDown instead of onClick to avoid "Enter" from triggering it
  onMouseDown,
  disabled = false,
}: InputValueHelperProps) => {
  const handleClick = (e: SyntheticEvent) => {
    e.preventDefault()
    onMouseDown()
  }

  return (
    <Link
      // Without a type, the parent form will submit
      type="button"
      component="button"
      onMouseDown={handleClick}
      sx={disabled ? { visibility: 'hidden' } : undefined}
    >
      {children}
    </Link>
  )
}

export default InputValueHelper
