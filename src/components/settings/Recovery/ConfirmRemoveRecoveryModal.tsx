import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  SvgIcon,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useContext } from 'react'
import type { ReactElement } from 'react'

import AlertIcon from '@/public/images/notifications/alert.svg'
import { TxModalContext } from '@/components/tx-flow'
import { RemoveRecoveryFlow } from '@/components/tx-flow/flows/RemoveRecovery'
import type { RecoveryStateItem } from '@/components/recovery/RecoveryContext'

export function ConfirmRemoveRecoveryModal({
  open,
  onClose,
  delayModifier,
}: {
  open: boolean
  onClose: () => void
  delayModifier: RecoveryStateItem
}): ReactElement {
  const { setTxFlow } = useContext(TxModalContext)

  const onConfirm = () => {
    setTxFlow(<RemoveRecoveryFlow delayModifier={delayModifier} />)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle display="flex" alignItems="center" sx={{ pt: 3 }}>
        <SvgIcon
          component={AlertIcon}
          inheritViewBox
          sx={{
            color: (theme) => theme.palette.error.main,
            mr: '10px',
          }}
        />
        Remove the recovery module?
        <IconButton
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.text.secondary,
            ml: 'auto',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2, px: 3 }}>
        <DialogContentText color="text.primary">
          Are you sure you wish to remove the recovery module? The assigned guardian won&apos;t be able to recover this
          Safe account for you.
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', p: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} autoFocus variant="danger">
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  )
}
