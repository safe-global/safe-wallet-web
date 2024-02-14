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
const AccountsList = ({ safes, onLinkClick }: AccountsListProps) => {
  const [maxShown, setMaxShown] = useState<number>(DEFAULT_SHOWN)

  const shownSafes = useMemo(() => {
    if (safes.length <= MAX_DEFAULT_SHOWN) {
      return safes
    }
    return safes.slice(0, maxShown)
  }, [safes, maxShown])

  const onShowMore = () => {
    const pageSize = 100 // DEFAULT_SHOWN
    setMaxShown((prev) => prev + pageSize)
  }

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
              ({safes.length})
            </Typography>
          </Typography>
          {shownSafes.length ? (
            shownSafes.map((item) => (
              <AccountItem onLinkClick={onLinkClick} {...item} key={item.chainId + item.address} />
            ))
          ) : (
            <Typography variant="body2" color="primary.light" textAlign="center" my={3}>
              You don&apos;t have any Safe Accounts yet
            </Typography>
          )}
          {safes.length > shownSafes.length && (
            <Box display="flex" justifyContent="center">
              <Track {...OVERVIEW_EVENTS.SHOW_MORE_SAFES}>
                <Button onClick={onShowMore}>Show more</Button>
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
          {shownSafes.length ? (
            shownSafes.map((item) => (
              <AccountItem onLinkClick={onLinkClick} {...item} key={item.chainId + item.address} />
            ))
          ) : (
            <Typography variant="body2" color="primary.light" textAlign="center" my={3}>
              You don&apos;t have any Safe Accounts yet
            </Typography>
          )}
          {safes.length > shownSafes.length && (
            <Box display="flex" justifyContent="center">
              <Track {...OVERVIEW_EVENTS.SHOW_MORE_SAFES}>
                <Button onClick={onShowMore}>Show more</Button>
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
