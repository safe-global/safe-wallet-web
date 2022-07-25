import { ReactElement } from 'react'
import { Dialog, DialogTitle, useMediaQuery, type DialogProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { theme } from '@/styles/theme'

interface ModalDialogProps extends DialogProps {
  title?: string
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogActions-root': {
    borderTop: `2px solid ${theme.palette.divider}`,
    padding: theme.spacing(3),

    '& > :last-child:not(:first-of-type)': {
      order: 2,
    },
    '&:after': {
      content: '""',
      order: 1,
      flex: 1,
    },
  },
  '& .MuiDialogTitle-root': {
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
}))

const ModalDialog = ({ title, children, ...restProps }: ModalDialogProps): ReactElement => {
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <StyledDialog {...restProps} fullScreen={fullScreen} onClick={(e) => e.stopPropagation()}>
      {title && <DialogTitle>{title}</DialogTitle>}
      {children}
    </StyledDialog>
  )
}

export default ModalDialog
