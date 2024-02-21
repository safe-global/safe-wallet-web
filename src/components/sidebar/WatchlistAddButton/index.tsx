import Button from '@mui/material/Button'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeAddress from '@/hooks/useSafeAddress'

const WatchlistAddButton = () => {
  const router = useRouter()
  const chain = useCurrentChain()
  const address = useSafeAddress()

  const onClick = () => {
    trackEvent({ ...OVERVIEW_EVENTS.ADD_SAFE })

    router.push({
      pathname: AppRoutes.newSafe.load,
      query: {
        chain: chain?.shortName,
        address: address,
      },
    })
  }

  return (
    <Button
      data-testid="add-watchlist-btn"
      onClick={onClick}
      variant="contained"
      size="small"
      fullWidth
      disableElevation
      sx={{ py: 1.3 }}
    >
      Add to watchlist
    </Button>
  )
}

export default WatchlistAddButton
