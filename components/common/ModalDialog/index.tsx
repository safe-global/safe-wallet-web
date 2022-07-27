import { Dialog, DialogTitle, type DialogProps, IconButton, useMediaQuery, ModalProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import { theme } from '@/styles/theme'
import ChainIndicator from '@/components/common/ChainIndicator'
import * as React from 'react'

interface ModalDialogProps extends DialogProps {
  dialogTitle?: React.ReactNode
  hideChainIndicator?: boolean
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
  children: React.ReactNode
  onClose?: ModalProps['onClose']
  hideChainIndicator?: boolean
}

const CustomDialogTitle = ({ children, onClose, hideChainIndicator = false, ...other }: DialogTitleProps) => {
  return (
    <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center' }} {...other}>
      {children}
      <span style={{ flex: 1 }} />
      {!hideChainIndicator && <ChainIndicator inline />}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={(e) => {
            onClose(e, 'backdropClick')
          }}
          size="small"
          sx={{
            ml: 'auto',
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  )
}

const ModalDialog = ({
  dialogTitle,
  hideChainIndicator,
  children,
  ...restProps
}: ModalDialogProps): React.ReactElement => {
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <StyledDialog {...restProps} fullScreen={fullScreen} onClick={(e) => e.stopPropagation()}>
      {dialogTitle && (
        <CustomDialogTitle onClose={restProps.onClose} hideChainIndicator={hideChainIndicator}>
          {dialogTitle}
        </CustomDialogTitle>
      )}

      {children}
    </StyledDialog>
  )
}

export default ModalDialog
