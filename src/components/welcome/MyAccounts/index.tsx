import { Box, Button, Link, Typography } from '@mui/material'
import madProps from '@/utils/mad-props'
import CreateButton from './CreateButton'
import useAllSafes, { type SafeItems } from './useAllSafes'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import css from './styles.module.css'
import { AppRoutes } from '@/config/routes'
import useWallet from '@/hooks/wallets/useWallet'
import { useRouter } from 'next/router'
import AccountItem from './AccountItem'
import ConnectWalletButton from '@/components/common/ConnectWallet/ConnectWalletButton'
import { useAppDispatch } from '@/store'
import { getSafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { addSafeToWatchlist } from '@/components/new-safe/load/logic'
import { removeSafe } from '@/store/addedSafesSlice'
import { useEffect, useMemo, useState } from 'react'

const NO_SAFES_MESSAGE = "You don't have any Safe Accounts yet"

type AccountsListProps = {
  safes: SafeItems | undefined
  onLinkClick?: () => void
}
const AccountsList = ({ safes, onLinkClick }: AccountsListProps) => {
  const wallet = useWallet()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [updatedSafes, setUpdatedSafes] = useState<SafeItems | undefined>()

  // useTrackSafesCount(ownedSafes, watchlistSafes)

  const isLoginPage = router.pathname === AppRoutes.welcome.accounts
  const trackingLabel = isLoginPage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  useEffect(() => {
    setUpdatedSafes(undefined)
  }, [wallet])

  const displayedSafes = useMemo(() => {
    return updatedSafes || safes?.sort((a, b) => Number(b.isBookmarked) - Number(a.isBookmarked))
  }, [safes, updatedSafes])

  const addToBookmarks = async (chainId: string, address: string) => {
    const updatedSafes = displayedSafes?.map((safe) => {
      return chainId === safe.chainId && address === safe.address ? { ...safe, isBookmarked: true } : safe
    })
    setUpdatedSafes(updatedSafes)
    const safeInfo = await getSafeInfo(chainId, address)
    addSafeToWatchlist(dispatch, safeInfo, '')
  }

  const removeFromBookmarks = (chainId: string, address: string) => {
    const updatedSafes = displayedSafes?.map((safe) => {
      return chainId === safe.chainId && address === safe.address ? { ...safe, isBookmarked: false } : safe
    })
    setUpdatedSafes(updatedSafes)
    dispatch(removeSafe({ chainId, address }))
  }

  return (
    <Box data-testid="sidebar-safe-container" className={css.container}>
      <Box className={css.myAccounts}>
        <Box className={css.header}>
          <Typography variant="h1" fontWeight={700} className={css.title}>
            My accounts
          </Typography>
          <Track {...OVERVIEW_EVENTS.ADD_TO_WATCHLIST} label={trackingLabel}>
            <Link href={AppRoutes.newSafe.load}>
              <Button disableElevation size="small" variant="outlined" component="a" onClick={onLinkClick}>
                Watch Account
              </Button>
            </Link>
          </Track>
          <Track {...OVERVIEW_EVENTS.CREATE_NEW_SAFE} label={trackingLabel}>
            <CreateButton compact={true} />
          </Track>
        </Box>

        <div className={css.safeList}>
          {displayedSafes?.length ? (
            displayedSafes.map((item) => (
              <AccountItem
                onLinkClick={onLinkClick}
                {...item}
                key={item.chainId + item.address}
                addToBookmarks={addToBookmarks}
                removeFromBookmarks={removeFromBookmarks}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={3} mx="auto" width={250}>
              {wallet ? (
                NO_SAFES_MESSAGE
              ) : (
                <>
                  <Box mb={2}>Connect a wallet to view your Safe Accounts or to create a new one</Box>
                  <Track {...OVERVIEW_EVENTS.OPEN_ONBOARD} label={trackingLabel}>
                    <ConnectWalletButton text="Connect a wallet" contained={false} />
                  </Track>
                </>
              )}
            </Typography>
          )}
        </div>
      </Box>
    </Box>
  )
}

const MyAccounts = madProps(AccountsList, {
  safes: useAllSafes,
})

export default MyAccounts
