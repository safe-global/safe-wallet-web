import { type ReactElement, type ReactNode } from 'react'
import IconButton from '@mui/material/IconButton'
import { type ModalProps } from '@mui/material/Modal'
import Dialog, { type DialogProps } from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import ChainIndicator from '@/components/common/ChainIndicator'
import CloseIcon from '@mui/icons-material/Close'

import css from './styles.module.css'

interface ModalDialogProps extends DialogProps {
  dialogTitle?: React.ReactNode
  hideChainIndicator?: boolean
}

interface DialogTitleProps {
  children: ReactNode
  onClose?: ModalProps['onClose']
  hideChainIndicator?: boolean
}

export const ModalDialogTitle = ({ children, onClose, hideChainIndicator = false, ...other }: DialogTitleProps) => {
  return (
    <DialogTitle
      data-testid="modal-title"
      sx={{ m: 0, px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
      {...other}
    >
      {children}
      <span style={{ flex: 1 }} />
      {!hideChainIndicator && <ChainIndicator inline />}
      {onClose ? (
        <IconButton
          data-testid="modal-dialog-close-btn"
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
}: ModalDialogProps): ReactElement => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isFullScreen = fullScreen || isSmallScreen

  return (
    <Dialog
      data-testid="modal-view"
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
