import { type ReactElement, type ReactNode, useState } from 'react'
import { type ModalProps, Tooltip } from '@mui/material'
import { Dialog, DialogTitle, type DialogProps, IconButton, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import ChainIndicator from '@/components/common/ChainIndicator'

import css from './styles.module.css'

interface ModalDialogProps extends DialogProps {
  dialogTitle?: React.ReactNode
  hideChainIndicator?: boolean
}

interface DialogTitleProps {
  children: ReactNode
  onClose?: ModalProps['onClose']
  hideChainIndicator?: boolean
  closeButtonTooltip?: ReactElement
}

export const ModalDialogTitle = ({
  children,
  onClose,
  hideChainIndicator = false,
  closeButtonTooltip,
  ...other
}: DialogTitleProps) => {
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false)

  return (
    <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center' }} {...other}>
      {children}
      <span style={{ flex: 1 }} />
      {!hideChainIndicator && <ChainIndicator inline />}
      {onClose ? (
        <Tooltip
          open={tooltipOpen && !!closeButtonTooltip}
          title={closeButtonTooltip}
          arrow
          disableHoverListener
          disableFocusListener
        >
          <IconButton
            aria-label="close"
            onClick={(e) => {
              setTooltipOpen((val) => !val)
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
        </Tooltip>
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
