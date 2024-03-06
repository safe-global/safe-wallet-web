import CloseIcon from '@mui/icons-material/Close'
import { Dialog, DialogTitle, IconButton, type DialogProps } from '@mui/material'
import classnames from 'classnames'
import { type ReactElement } from 'react'
import css from './styles.module.css'

interface ModalDialogProps extends DialogProps {
  dialogTitle?: React.ReactNode
  hideChainIndicator?: boolean
}

const TxModalDialog = ({
  dialogTitle,
  hideChainIndicator,
  children,
  onClose,
  fullScreen = false,
  fullWidth = false,
  ...restProps
}: ModalDialogProps): ReactElement => {
  return (
    <Dialog
      {...restProps}
      fullScreen={true}
      scroll={fullScreen ? 'paper' : 'body'}
      className={classnames(css.dialog, { [css.fullWidth]: fullWidth })}
      onClick={(e) => e.stopPropagation()}
      hideBackdrop
      PaperProps={{
        className: css.paper,
      }}
    >
      <DialogTitle className={css.title}>
        <div data-sid="37371" className={css.buttons}>
          <IconButton
            className={css.close}
            aria-label="close"
            onClick={(e) => onClose?.(e, 'backdropClick')}
            size="small"
          >
            <CloseIcon fontSize="large" />
          </IconButton>
        </div>
      </DialogTitle>

      {children}
    </Dialog>
  )
}

export default TxModalDialog
