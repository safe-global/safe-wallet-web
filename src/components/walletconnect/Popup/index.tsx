import { Paper, Popover } from '@mui/material'
import type { PopoverProps } from '@mui/material'

const Popup = ({ children, ...props }: PopoverProps) => {
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
      {...props}
    >
      <Paper sx={{ p: 2 }}>{children}</Paper>
    </Popover>
  )
}

export default Popup
