import { type ReactElement, type ReactNode, useContext } from 'react'
import { IconButton, type ModalProps } from '@mui/material'
import { Dialog, DialogTitle, type DialogProps, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ChainIndicator from '@/components/common/ChainIndicator'
import CloseIcon from '@mui/icons-material/Close'

import css from './styles.module.css'
import { ModalContext } from '@/components/TxFlow/ModalProvider'

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

const NewModalDialog = ({
  dialogTitle,
  hideChainIndicator,
  children,
  fullScreen = false,
  ...restProps
}: ModalDialogProps): ReactElement => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))
  const { setVisibleModal } = useContext(ModalContext)

  return (
    <Dialog
      {...restProps}
      fullScreen={true}
      scroll={fullScreen ? 'paper' : 'body'}
      className={css.dialog}
      onClick={(e) => e.stopPropagation()}
      sx={{
        top: 52,
        left: isSmallScreen ? 0 : 230,
        zIndex: 1200,
      }}
      slots={{ backdrop: 'div' }}
      PaperProps={{
        sx: {
          pb: 8,
          backgroundColor: (theme) => theme.palette.border.background,
        },
      }}
    >
      <DialogTitle
        sx={{
          mb: 8,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <span style={{ flex: 1 }} />
        <IconButton
          aria-label="close"
          onClick={() => setVisibleModal(undefined)}
          size="small"
          sx={{
            ml: 2,
            color: 'border.main',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {children}
    </Dialog>
  )
}

export default NewModalDialog
