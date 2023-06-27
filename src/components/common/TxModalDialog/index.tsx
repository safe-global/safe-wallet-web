import { Fragment, type ReactElement } from 'react'
import { IconButton } from '@mui/material'
import { Dialog, DialogTitle, type DialogProps } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
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
  ...restProps
}: ModalDialogProps): ReactElement => {
  return (
    <Dialog
      {...restProps}
      fullScreen={true}
      scroll={fullScreen ? 'paper' : 'body'}
      className={css.dialog}
      onClick={(e) => e.stopPropagation()}
      TransitionComponent={Fragment}
      slots={{ backdrop: Fragment }}
      PaperProps={{
        className: css.paper,
      }}
    >
      <DialogTitle className={css.title}>
        <div className={css.buttons}>
          <IconButton
            className={css.close}
            aria-label="close"
            onClick={(e) => onClose?.(e, 'backdropClick')}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      {children}
    </Dialog>
  )
}

export default TxModalDialog
