import BatchIndicator from '@/components/batch/BatchIndicator'
import ConnectWallet from '@/components/common/ConnectWallet'
import NetworkSelector from '@/components/common/NetworkSelector'
import SafeTokenWidget, { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import Track from '@/components/common/Track'
import NotificationCenter from '@/components/notification-center/NotificationCenter'
import { PushNotificationsBanner } from '@/components/settings/PushNotifications/PushNotificationsBanner'
import { AppRoutes } from '@/config/routes'
import WalletConnect from '@/features/walletconnect/components'
import useChainId from '@/hooks/useChainId'
import { useHasFeature } from '@/hooks/useChains'
import useSafeAddress from '@/hooks/useSafeAddress'
import SafeLogo from '@/public/images/logo.svg'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { FEATURES } from '@/utils/chains'
import MenuIcon from '@mui/icons-material/Menu'
import { IconButton, Paper } from '@mui/material'
import classnames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { Dispatch, SetStateAction } from 'react'
import { type ReactElement } from 'react'
import css from './styles.module.css'

type HeaderProps = {
  onMenuToggle?: Dispatch<SetStateAction<boolean>>
  onBatchToggle?: Dispatch<SetStateAction<boolean>>
}

const Header = ({ onMenuToggle, onBatchToggle }: HeaderProps): ReactElement => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const showSafeToken = safeAddress && !!getSafeTokenAddress(chainId)
  const router = useRouter()
  const enableWc = useHasFeature(FEATURES.NATIVE_WALLETCONNECT)

  // Logo link: if on Dashboard, link to Welcome, otherwise to the root (which redirects to either Dashboard or Welcome)
  const logoHref = router.pathname === AppRoutes.home ? AppRoutes.welcome.index : AppRoutes.index

  const handleMenuToggle = () => {
    if (onMenuToggle) {
      onMenuToggle((isOpen) => !isOpen)
    } else {
      router.push(logoHref)
    }
  }

  const handleBatchToggle = () => {
    if (onBatchToggle) {
      onBatchToggle((isOpen) => !isOpen)
    }
  }

  return (
    <Paper className={css.container}>
      <div
        data-sid="42635"
        className={classnames(css.element, css.menuButton, !onMenuToggle ? css.hideSidebarMobile : null)}
      >
        <IconButton onClick={handleMenuToggle} size="large" edge="start" color="default" aria-label="menu">
          <MenuIcon />
        </IconButton>
      </div>

      <div data-sid="64042" className={classnames(css.element, css.hideMobile, css.logo)}>
        <Link href={logoHref} passHref>
          <SafeLogo alt="Safe logo" />
        </Link>
      </div>

      {showSafeToken && (
        <div data-sid="80958" className={classnames(css.element, css.hideMobile)}>
          <SafeTokenWidget />
        </div>
      )}

      <div data-sid="15477" className={css.element}>
        <PushNotificationsBanner>
          <NotificationCenter />
        </PushNotificationsBanner>
      </div>

      {safeAddress && (
        <div data-sid="74836" className={classnames(css.element, css.hideMobile)}>
          <BatchIndicator onClick={handleBatchToggle} />
        </div>
      )}

      {enableWc && (
        <div data-sid="18922" className={classnames(css.element, css.hideMobile)}>
          <WalletConnect />
        </div>
      )}

      <div data-sid="94585" className={classnames(css.element, css.connectWallet)}>
        <Track label={OVERVIEW_LABELS.top_bar} {...OVERVIEW_EVENTS.OPEN_ONBOARD}>
          <ConnectWallet />
        </Track>
      </div>

      <div data-sid="11841" className={classnames(css.element, css.networkSelector)}>
        <NetworkSelector />
      </div>
    </Paper>
  )
}

export default Header
