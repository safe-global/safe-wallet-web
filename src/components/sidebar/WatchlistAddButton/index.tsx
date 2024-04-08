import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Button } from '@mui/material'
import SafeListRemoveDialog from '../SafeListRemoveDialog'
import { useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'
import { useState } from 'react'
import { VisibilityOutlined } from '@mui/icons-material'
import Track from '@/components/common/Track'

const WatchlistAddButton = () => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const chain = useCurrentChain()
  const address = useSafeAddress()
  const chainId = chain?.chainId || ''
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, chainId))
  const isInWatchlist = !!addedSafes?.[address]

  const onClick = () => {
    router.push({
      pathname: AppRoutes.newSafe.load,
      query: {
        chain: chain?.shortName,
        address,
      },
    })
  }

  return (
    <>
      {isInWatchlist ? (
        <Track {...OVERVIEW_EVENTS.REMOVE_FROM_WATCHLIST} label={OVERVIEW_LABELS.quick_remove}>
          <Button
            data-testid="remove-watchlist-btn"
            onClick={() => setOpen(true)}
            variant="outlined"
            size="small"
            fullWidth
            disableElevation
            sx={{ py: 1.3, px: 1 }}
          >
            Remove from watchlist
          </Button>
        </Track>
      ) : (
        <Track {...OVERVIEW_EVENTS.ADD_TO_WATCHLIST} label={OVERVIEW_LABELS.quick_add}>
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
        </Track>
      )}

      {open && chainId && (
        <SafeListRemoveDialog handleClose={() => setOpen(false)} address={address} chainId={chainId} />
      )}
    </>
  )
}

export default WatchlistAddButton
