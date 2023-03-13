import type { ModalProps } from '@mui/material'
import { Dialog, DialogTitle, type DialogProps, IconButton, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import ChainIndicator from '@/components/common/ChainIndicator'
import * as React from 'react'

import css from './styles.module.css'

interface ModalDialogProps extends DialogProps {
  dialogTitle?: React.ReactNode
  hideChainIndicator?: boolean
}

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
  fullScreen = false,
  ...restProps
}: ModalDialogProps): React.ReactElement => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isFullScreen = fullScreen || isSmallScreen

  return (
    <Dialog
      {...restProps}
      fullScreen={isFullScreen}
      scroll={fullScreen ? 'paper' : 'body'}
      className={css.dialog}
      onClick={(e) => e.stopPropagation()}
    >
      {dialogTitle && (
        <ModalDialogTitle onClose={restProps.onClose} hideChainIndicator={hideChainIndicator}>
          {dialogTitle}
        </ModalDialogTitle>
      )}

      {children}
    </Dialog>
  )
}

export default ModalDialog
