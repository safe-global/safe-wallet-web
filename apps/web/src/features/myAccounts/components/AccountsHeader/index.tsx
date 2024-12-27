import ConnectWalletButton from '@/components/common/ConnectWallet/ConnectWalletButton'
import Track from '@/components/common/Track'
import { AppRoutes } from '@/config/routes'
import CreateButton from '@/features/myAccounts/components/CreateButton'
import css from '@/features/myAccounts/styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import AddIcon from '@/public/images/common/add.svg'
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { Box, Button, Link, SvgIcon, Typography } from '@mui/material'
import classNames from 'classnames'
import { useRouter } from 'next/router'

const AccountsHeader = ({ isSidebar, onLinkClick }: { isSidebar: boolean; onLinkClick?: () => void }) => {
  const router = useRouter()
  const wallet = useWallet()

  const isLoginPage = router.pathname === AppRoutes.welcome.accounts
  const trackingLabel = isLoginPage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  return (
    <Box className={classNames(css.header, { [css.sidebarHeader]: isSidebar })}>
      <Typography variant="h1" fontWeight={700} className={css.title}>
        My accounts
      </Typography>

      <Box className={css.headerButtons}>
        <Link href={AppRoutes.welcome.bundles}>
          <Button
            disableElevation
            variant="outlined"
            size="small"
            startIcon={<SvgIcon component={ViewQuiltIcon} inheritViewBox fontSize="small" />}
            sx={{ height: '36px', width: '100%', px: 2 }}
          >
            Bundles
          </Button>
        </Link>

        <Track {...OVERVIEW_EVENTS.ADD_TO_WATCHLIST} label={trackingLabel}>
          <Link href={AppRoutes.newSafe.load}>
            <Button
              disableElevation
              variant="outlined"
              size="small"
              onClick={onLinkClick}
              startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
              sx={{ height: '36px', width: '100%', px: 2 }}
            >
              Add
            </Button>
          </Link>
        </Track>

        {wallet ? (
          <Track {...OVERVIEW_EVENTS.CREATE_NEW_SAFE} label={trackingLabel}>
            <CreateButton isPrimary />
          </Track>
        ) : (
          <Box sx={{ '& button': { height: '36px' } }}>
            <ConnectWalletButton small={true} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default AccountsHeader
