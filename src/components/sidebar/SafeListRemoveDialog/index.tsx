import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import type { ReactElement } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import Track from '@/components/common/Track'
import { AppRoutes } from '@/config/routes'
import useAddressBook from '@/hooks/useAddressBook'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { useAppDispatch } from '@/store'
import { removeSafe } from '@/store/addedSafesSlice'
import router from 'next/router'

const SafeListRemoveDialog = ({
  handleClose,
  address,
  chainId,
}: {
  handleClose: () => void
  address: string
  chainId: string
}): ReactElement => {
  const dispatch = useAppDispatch()
  const addressBook = useAddressBook()
  const trackingLabel =
    router.pathname === AppRoutes.welcome.accounts ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  const safe = addressBook?.[address] || address

  const handleConfirm = () => {
    dispatch(removeSafe({ chainId, address }))
    handleClose()
  }

  return (
    <ModalDialog open onClose={handleClose} dialogTitle="Delete entry">
      <DialogContent sx={{ p: '24px !important' }}>
        <Typography>
          Are you sure you want to remove <b>{safe}</b> from your Watchlist?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button data-sid="28094" data-testid="cancel-btn" onClick={handleClose}>
          Cancel
        </Button>
        <Track {...OVERVIEW_EVENTS.DELETED_FROM_WATCHLIST} label={trackingLabel}>
          <Button data-sid="52820" data-testid="delete-btn" onClick={handleConfirm} variant="danger" disableElevation>
            Delete
          </Button>
        </Track>
      </DialogActions>
    </ModalDialog>
  )
}

export default SafeListRemoveDialog
