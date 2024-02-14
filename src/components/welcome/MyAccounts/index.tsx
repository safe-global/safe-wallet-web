import { useMemo, useState } from 'react'
import { Button, Box, Paper, Typography, Link, SvgIcon } from '@mui/material'
import madProps from '@/utils/mad-props'
import AccountItem from './AccountItem'
import CreateButton from './CreateButton'
import useAllSafes, { type SafeItems } from './useAllSafes'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import { DataWidget } from '@/components/welcome/SafeListDrawer/DataWidget'
import css from './styles.module.css'
import { VisibilityOutlined } from '@mui/icons-material'
import AddIcon from '@/public/images/common/add.svg'
import { AppRoutes } from '@/config/routes'

type AccountsListProps = {
  safes: SafeItems
  onLinkClick?: () => void
}

const DEFAULT_SHOWN = 5
const MAX_DEFAULT_SHOWN = 7
const PAGE_SIZE = 5
const AccountsList = ({ safes, onLinkClick }: AccountsListProps) => {
  const [maxShownOwnedSafes, setMaxShownOwnedSafes] = useState<number>(DEFAULT_SHOWN)
  const [maxShownWatchlistSafes, setMaxShownWatchlistSafes] = useState<number>(DEFAULT_SHOWN)

  const ownedSafes = useMemo(() => safes.filter(({ isWatchlist }) => !isWatchlist), [safes])
  const watchlistSafes = useMemo(() => safes.filter(({ isWatchlist }) => isWatchlist), [safes])

  const shownOwnedSafes = useMemo(() => {
    if (ownedSafes.length <= MAX_DEFAULT_SHOWN) {
      return ownedSafes
    }
    return ownedSafes.slice(0, maxShownOwnedSafes)
  }, [ownedSafes, maxShownOwnedSafes])

  const shownWatchlistSafes = useMemo(() => {
    if (watchlistSafes.length <= MAX_DEFAULT_SHOWN) {
      return watchlistSafes
    }
    return watchlistSafes.slice(0, maxShownWatchlistSafes)
  }, [watchlistSafes, maxShownWatchlistSafes])

  const onShowMoreOwnedSafes = () => setMaxShownOwnedSafes((prev) => prev + PAGE_SIZE)
  const onShowMoreWatchlistSafes = () => setMaxShownWatchlistSafes((prev) => prev + PAGE_SIZE)

  return (
    <Box className={css.container}>
      <Box className={css.myAccounts}>
        <Box className={css.header}>
          <Typography variant="h1" fontWeight={700} className={css.title}>
            Safe accounts
          </Typography>
          <CreateButton />
        </Box>

        <Paper className={css.safeList}>
          <Typography variant="h5" fontWeight={700} mb={2}>
            My accounts
            <Typography component="span" color="text.secondary" fontSize="inherit" fontWeight="normal">
              {' '}
              ({ownedSafes.length})
            </Typography>
          </Typography>
          {shownOwnedSafes.length ? (
            shownOwnedSafes.map((item) => (
              <AccountItem onLinkClick={onLinkClick} {...item} key={item.chainId + item.address} />
            ))
          ) : (
            <Typography variant="body2" color="primary.light" textAlign="center" my={3}>
              You don&apos;t have any Safe Accounts yet
            </Typography>
          )}
          {ownedSafes.length > shownOwnedSafes.length && (
            <Box display="flex" justifyContent="center">
              <Track {...OVERVIEW_EVENTS.SHOW_MORE_SAFES}>
                <Button onClick={onShowMoreOwnedSafes}>Show more</Button>
              </Track>
            </Box>
          )}
        </Paper>

        <Paper className={css.safeList}>
          <div className={css.watchlistHeader}>
            <Typography variant="h5" display="inline" fontWeight={700} className={css.watchlistTitle}>
              <VisibilityOutlined sx={{ verticalAlign: 'middle', marginRight: '10px' }} fontSize="small" />
              Watchlist
            </Typography>
            <Track {...OVERVIEW_EVENTS.ADD_SAFE}>
              <Link href={AppRoutes.newSafe.load}>
                <Button
                  disableElevation
                  size="small"
                  onClick={onLinkClick}
                  startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
                >
                  Add
                </Button>
              </Link>
            </Track>
          </div>{' '}
          {shownWatchlistSafes.length ? (
            shownWatchlistSafes.map((item) => (
              <AccountItem onLinkClick={onLinkClick} {...item} key={item.chainId + item.address} />
            ))
          ) : (
            <Typography variant="body2" color="primary.light" textAlign="center" my={3}>
              You don&apos;t have any Safe Accounts yet
            </Typography>
          )}
          {watchlistSafes.length > shownWatchlistSafes.length && (
            <Box display="flex" justifyContent="center">
              <Track {...OVERVIEW_EVENTS.SHOW_MORE_SAFES}>
                <Button onClick={onShowMoreWatchlistSafes}>Show more</Button>
              </Track>
            </Box>
          )}
        </Paper>

        <DataWidget />
      </Box>
    </Box>
  )
}

const MyAccounts = madProps(AccountsList, {
  safes: useAllSafes,
})

export default MyAccounts
