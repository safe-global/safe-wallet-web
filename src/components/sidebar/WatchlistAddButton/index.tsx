import { addSafeToWatchlist } from '@/components/new-safe/load/logic'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import useSafeInfo from '@/hooks/useSafeInfo'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { Button } from '@mui/material'
import SafeListRemoveDialog from '../SafeListRemoveDialog'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'
import { useState } from 'react'
import { VisibilityOutlined } from '@mui/icons-material'

const WatchlistAddButton = () => {
  const [open, setOpen] = useState(false)
  const { safe } = useSafeInfo()
  const dispatch = useAppDispatch()
  const safeName = useMnemonicSafeName()
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, safe.chainId))
  const isInWatchlist = !!addedSafes?.[safe.address.value]

  const onClick = () => {
    trackEvent({ ...OVERVIEW_EVENTS.ADD_SAFE })
    addSafeToWatchlist(dispatch, safe, safeName)
  }

  return (
    <>
      {!isInWatchlist ? (
        <Button
          data-testid="add-watchlist-btn"
          onClick={onClick}
          variant="outlined"
          size="small"
          fullWidth
          disableElevation
          sx={{ py: 1.3 }}
          startIcon={<VisibilityOutlined sx={{ verticalAlign: 'middle', marginRight: 1 }} />}
        >
          Add to watchlist
        </Button>
      ) : (
        <Button
          data-testid="add-watchlist-btn"
          onClick={() => setOpen(true)}
          variant="outlined"
          size="small"
          fullWidth
          disableElevation
          sx={{ py: 1.3, px: 1 }}
        >
          Remove from watchlist
        </Button>
      )}

      {open && safe.chainId && (
        <SafeListRemoveDialog handleClose={() => setOpen(false)} address={safe.address.value} chainId={safe.chainId} />
      )}
    </>
  )
}

export default WatchlistAddButton
