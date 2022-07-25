import { Dialog, DialogTitle, type DialogProps, IconButton, useMediaQuery, ModalProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import theme from '@/styles/theme'

interface ModalDialogProps extends DialogProps {
  dialogTitle?: React.ReactNode
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

interface DialogTitleProps {
  children?: React.ReactNode
  onClose?: ModalProps['onClose']
}

const CustomDialogTitle = ({ children, onClose, ...other }: DialogTitleProps) => {
  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={(e) => {
            onClose(e, 'backdropClick')
          }}
          size="small"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  )
}

const ModalDialog = ({ dialogTitle, children, ...restProps }: ModalDialogProps): React.ReactElement => {
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <StyledDialog {...restProps} fullScreen={fullScreen} onClick={(e) => e.stopPropagation()}>
      {dialogTitle && <CustomDialogTitle onClose={restProps.onClose}>{dialogTitle}</CustomDialogTitle>}
      {children}
    </StyledDialog>
  )
}

export default ModalDialog
