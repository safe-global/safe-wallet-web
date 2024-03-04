import { Box, Typography } from '@mui/material'
import madProps from '@/utils/mad-props'
import CreateButton from './CreateButton'
import useAllSafes, { type SafeItems } from './useAllSafes'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { DataWidget } from '@/components/welcome/MyAccounts/DataWidget'
import css from './styles.module.css'
import PaginatedSafeList from './PaginatedSafeList'
import { AppRoutes } from '@/config/routes'
import ConnectWalletButton from '@/components/common/ConnectWallet/ConnectWalletButton'
import useWallet from '@/hooks/wallets/useWallet'
import { useRouter } from 'next/router'

const NO_SAFES_MESSAGE = "You don't have any Safe Accounts yet"

type AccountsListProps = {
  safes: SafeItems | undefined
  onLinkClick?: () => void
}
const AccountsList = ({ safes, onLinkClick }: AccountsListProps) => {
  const wallet = useWallet()
  const router = useRouter()

  // useTrackSafesCount(ownedSafes, watchlistSafes)

  const isLoginPage = router.pathname === AppRoutes.welcome.accounts
  const trackingLabel = isLoginPage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  return (
    <Box data-testid="sidebar-safe-container" className={css.container}>
      <Box className={css.myAccounts}>
        <Box className={css.header}>
          <Typography variant="h1" fontWeight={700} className={css.title}>
            Safe accounts
          </Typography>
          <Track {...OVERVIEW_EVENTS.CREATE_NEW_SAFE} label={trackingLabel}>
            <CreateButton />
          </Track>
        </Box>

        <PaginatedSafeList
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
        <DataWidget />
      </Box>
    </Box>
  )
}

const MyAccounts = madProps(AccountsList, {
  safes: useAllSafes,
})

export default MyAccounts
