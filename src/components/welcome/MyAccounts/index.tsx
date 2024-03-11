import { Box, Button, Link, Typography, useMediaQuery, useTheme } from '@mui/material'
import madProps from '@/utils/mad-props'
import CreateButton from './CreateButton'
import useAllSafes, { type SafeItems } from './useAllSafes'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import css from './styles.module.css'
import SafeList from './SafeList'
import { AppRoutes } from '@/config/routes'
import ConnectWalletButton from '@/components/common/ConnectWallet/ConnectWalletButton'
import useWallet from '@/hooks/wallets/useWallet'
import { useRouter } from 'next/router'
import classNames from 'classnames'

const NO_SAFES_MESSAGE = "You don't have any Safe Accounts yet"

type AccountsListProps = {
  safes: SafeItems | undefined
  onLinkClick?: () => void
}
const AccountsList = ({ safes, onLinkClick }: AccountsListProps) => {
  const wallet = useWallet()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // useTrackSafesCount(ownedSafes, watchlistSafes)

  const isLoginPage = router.pathname === AppRoutes.welcome.accounts
  const trackingLabel = isLoginPage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  return (
    <Box data-testid="sidebar-safe-container" className={classNames({ [css.sidebar]: !isLoginPage }, css.container)}>
      <Box className={css.myAccounts}>
        <Box className={css.header}>
          <Typography variant="h1" fontWeight={700} className={css.title}>
            My accounts
          </Typography>
          <Track {...OVERVIEW_EVENTS.ADD_TO_WATCHLIST} label={trackingLabel}>
            <Link href={AppRoutes.newSafe.load}>
              <Button
                data-testid="create-safe-btn"
                disableElevation
                size="small"
                variant="outlined"
                component="a"
                onClick={onLinkClick}
              >
                Watch Account
              </Button>
            </Link>
          </Track>
          <Track {...OVERVIEW_EVENTS.CREATE_NEW_SAFE} label={trackingLabel}>
            <CreateButton compact={true} />
            {/* <CreateButton compact={!isLoginPage || isMobile} /> */}
          </Track>
        </Box>

        <SafeList
          safes={safes || []}
          onLinkClick={onLinkClick}
          noSafesMessage={
            wallet ? (
              NO_SAFES_MESSAGE
            ) : (
              <>
                <Box mb={2}>Connect a wallet to view your Safe Accounts or to create a new one</Box>
                <Track {...OVERVIEW_EVENTS.OPEN_ONBOARD} label={trackingLabel}>
                  <ConnectWalletButton text="Connect a wallet" contained={false} />
                </Track>
              </>
            )
          }
        />
      </Box>
      {/* <DataWidget /> */}
    </Box>
  )
}

const MyAccounts = madProps(AccountsList, {
  safes: useAllSafes,
})

export default MyAccounts
