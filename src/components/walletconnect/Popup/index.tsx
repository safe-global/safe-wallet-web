import type { ReactNode } from 'react'
import { Paper, Popover } from '@mui/material'

type PopupProps = {
  anchorEl: HTMLElement | SVGSVGElement | null
  open: boolean
  setOpen: (open: boolean) => void
  children: ReactNode
}

const Popup = (props: PopupProps) => {
  return (
    <Popover
      anchorEl={props.anchorEl}
      open={props.open}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      onClose={() => props.setOpen(false)}
    >
      <Paper>{props.children}</Paper>
    </Popover>
  )
}

export default Popup
