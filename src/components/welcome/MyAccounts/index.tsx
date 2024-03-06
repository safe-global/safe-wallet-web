import ConnectWalletButton from '@/components/common/ConnectWallet/ConnectWalletButton'
import Track from '@/components/common/Track'
import { DataWidget } from '@/components/welcome/MyAccounts/DataWidget'
import { AppRoutes } from '@/config/routes'
import useWallet from '@/hooks/wallets/useWallet'
import AddIcon from '@/public/images/common/add.svg'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import madProps from '@/utils/mad-props'
import { VisibilityOutlined } from '@mui/icons-material'
import { Box, Button, Link, SvgIcon, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import CreateButton from './CreateButton'
import PaginatedSafeList from './PaginatedSafeList'
import css from './styles.module.css'
import useAllSafes, { type SafeItems } from './useAllSafes'

const NO_SAFES_MESSAGE = "You don't have any Safe Accounts yet"

type AccountsListProps = {
  safes: SafeItems
  onLinkClick?: () => void
}
const AccountsList = ({ safes, onLinkClick }: AccountsListProps) => {
  const router = useRouter()
  const ownedSafes = useMemo(() => safes.filter(({ isWatchlist }) => !isWatchlist), [safes])
  const watchlistSafes = useMemo(() => safes.filter(({ isWatchlist }) => isWatchlist), [safes])
  const wallet = useWallet()
  const trackingLabel =
    router.pathname === AppRoutes.welcome.accounts ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  return (
    <Box data-sid="78056" data-testid="sidebar-safe-container" className={css.container}>
      <Box data-sid="11580" className={css.myAccounts}>
        <Box data-sid="53162" className={css.header}>
          <Typography variant="h1" fontWeight={700} className={css.title}>
            Safe accounts
          </Typography>
          <Track {...OVERVIEW_EVENTS.CREATE_NEW_SAFE} label={trackingLabel}>
            <CreateButton />
          </Track>
        </Box>

        <PaginatedSafeList
          title="My accounts"
          safes={ownedSafes}
          onLinkClick={onLinkClick}
          noSafesMessage={
            wallet ? (
              NO_SAFES_MESSAGE
            ) : (
              <>
                <Box data-sid="24887" mb={2}>
                  Connect a wallet to view your Safe Accounts or to create a new one
                </Box>
                <Track {...OVERVIEW_EVENTS.OPEN_ONBOARD} label={trackingLabel}>
                  <ConnectWalletButton text="Connect a wallet" contained={false} />
                </Track>
              </>
            )
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
            <Track {...OVERVIEW_EVENTS.ADD_TO_WATCHLIST} label={trackingLabel}>
              <Link href={AppRoutes.newSafe.load}>
                <Button
                  data-sid="25627"
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
          noSafesMessage={NO_SAFES_MESSAGE}
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
