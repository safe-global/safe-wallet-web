import { useMemo, useState } from 'react'
import { Button, Box, Paper, Typography } from '@mui/material'
import madProps from '@/utils/mad-props'
import AccountItem from './AccountItem'
import CreateButton from './CreateButton'
import useAllSafes, { type SafeItems } from './useAllSafes'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import { DataWidget } from '@/components/welcome/SafeListDrawer/DataWidget'
import css from './styles.module.css'
import classNames from 'classnames'
import router from 'next/router'
import { AppRoutes } from '@/config/routes'

type AccountsListProps = {
  safes: SafeItems
  closeDrawer?: () => void
}

const DEFAULT_SHOWN = 5
const MAX_DEFAULT_SHOWN = 7
const AccountsList = ({ safes, closeDrawer }: AccountsListProps) => {
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

  const isSidebar = router.pathname === AppRoutes.home

  return (
    <Box display="flex" justifyContent="center">
      <Box m={2} className={classNames(css.container, { [css.sidebarContainer]: isSidebar })}>
        <Box className={css.header}>
          <Typography variant="h1" fontWeight={700} className={css.title}>
            My Safe accounts
            <Typography component="span" color="text.secondary" fontSize="inherit" fontWeight="normal">
              {' '}
              ({safes.length})
            </Typography>
          </Typography>

          <CreateButton />
        </Box>

        <Paper className={css.safeList}>
          {shownSafes.length ? (
            shownSafes.map((item) => (
              <AccountItem
                closeDrawer={closeDrawer}
                {...item}
                key={item.chainId + item.address}
                isSidebar={isSidebar}
              />
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
