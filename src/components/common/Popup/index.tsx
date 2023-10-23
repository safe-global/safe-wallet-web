import { Paper, Popover } from '@mui/material'
import type { PopoverProps } from '@mui/material'
import type { ReactElement } from 'react'

const Popup = ({ children, ...props }: PopoverProps): ReactElement => {
  return (
    <Popover
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      sx={{
        '& > .MuiPaper-root': {
          top: 'var(--header-height) !important',
        },
      }}
      {...props}
    >
      <Paper sx={{ p: 4, width: '454px' }}>{children}</Paper>
    </Popover>
  )
}

export default Popup
