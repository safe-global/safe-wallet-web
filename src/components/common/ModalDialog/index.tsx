import type { ModalProps } from '@mui/material'
import { Dialog, DialogTitle, type DialogProps, IconButton, useMediaQuery } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import ChainIndicator from '@/components/common/ChainIndicator'
import * as React from 'react'

interface ModalDialogProps extends DialogProps {
  dialogTitle?: React.ReactNode
  hideChainIndicator?: boolean
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    minWidth: '600px',
    margin: '0px',
  },
  '& .MuiDialogActions-root': {
    borderTop: `2px solid ${theme.palette.divider}`,
    padding: theme.spacing(3),

    '& > :last-of-type:not(:first-of-type)': {
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

export const ModalDialogTitle = ({ children, onClose, hideChainIndicator = false, ...other }: DialogTitleProps) => {
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
            ml: 2,
            color: 'border.main',
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
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <StyledDialog
      {...restProps}
      fullScreen={fullScreen}
      scroll="body"
      PaperProps={{
        sx: {
          minWidth: [null, null, 600],
          margin: '0px',
        },
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {dialogTitle && (
        <ModalDialogTitle onClose={restProps.onClose} hideChainIndicator={hideChainIndicator}>
          {dialogTitle}
        </ModalDialogTitle>
      )}

      {children}
    </StyledDialog>
  )
}

export default ModalDialog
