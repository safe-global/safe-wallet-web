import { useMemo } from 'react'
import { Box, Button, Link, SvgIcon, Typography } from '@mui/material'
import madProps from '@/utils/mad-props'
import CreateButton from './CreateButton'
import useAllSafes, { type SafeItems } from './useAllSafes'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import { DataWidget } from '@/components/welcome/MyAccounts/DataWidget'
import css from './styles.module.css'
import PaginatedSafeList from './PaginatedSafeList'
import { VisibilityOutlined } from '@mui/icons-material'
import AddIcon from '@/public/images/common/add.svg'
import { AppRoutes } from '@/config/routes'
import ConnectWalletButton from '@/components/common/ConnectWallet/ConnectWalletButton'

type AccountsListProps = {
  safes: SafeItems
  onLinkClick?: () => void
}
const AccountsList = ({ safes, onLinkClick }: AccountsListProps) => {
  const ownedSafes = useMemo(() => safes.filter(({ isWatchlist }) => !isWatchlist), [safes])
  const watchlistSafes = useMemo(() => safes.filter(({ isWatchlist }) => isWatchlist), [safes])

  return (
    <Box className={css.container}>
      <Box className={css.myAccounts}>
        <Box className={css.header}>
          <Typography variant="h1" fontWeight={700} className={css.title}>
            Safe accounts
          </Typography>
          <CreateButton />
        </Box>

        <PaginatedSafeList
          title="My accounts"
          safes={ownedSafes}
          onLinkClick={onLinkClick}
          noSafesMessage={
            <>
              <Box mb={2}>Connect a wallet to view your Safe Accounts or to create a new one</Box>
              <ConnectWalletButton text="Connect a wallet" contained={false} />
            </>
          }
        />

        <PaginatedSafeList
          title={
            <>
              <VisibilityOutlined sx={{ verticalAlign: 'middle', marginRight: '10px' }} fontSize="small" />
              Watchlist
            </>
          }
          safes={watchlistSafes}
          action={
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
          }
          noSafesMessage="You don't have any Safe Accounts yet"
          onLinkClick={onLinkClick}
        />

        <DataWidget />
      </Box>
    </Box>
  )
}

const MyAccounts = madProps(AccountsList, {
  safes: useAllSafes,
})

export default MyAccounts
