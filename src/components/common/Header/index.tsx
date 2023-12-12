import type { Dispatch, SetStateAction } from 'react'
import { type ReactElement } from 'react'
import { useRouter } from 'next/router'
import { IconButton, Paper } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import classnames from 'classnames'
import css from './styles.module.css'
import ConnectWallet from '@/components/common/ConnectWallet'
import NetworkSelector from '@/components/common/NetworkSelector'
import SafeTokenWidget, { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import NotificationCenter from '@/components/notification-center/NotificationCenter'
import { AppRoutes } from '@/config/routes'
import useChainId from '@/hooks/useChainId'
import SafeLogo from '@/public/images/logo.svg'
import Link from 'next/link'
import useSafeAddress from '@/hooks/useSafeAddress'
import BatchIndicator from '@/components/batch/BatchIndicator'
import WalletConnectUi from '@/components/walletconnect'
import { PushNotificationsBanner } from '@/components/settings/PushNotifications/PushNotificationsBanner'
import { useCurrentChain } from '@/hooks/useChains'
import { hasFeature, FEATURES } from '@/utils/chains'

type HeaderProps = {
  onMenuToggle?: Dispatch<SetStateAction<boolean>>
  onBatchToggle?: Dispatch<SetStateAction<boolean>>
}

const Header = ({ onMenuToggle, onBatchToggle }: HeaderProps): ReactElement => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const showSafeToken = safeAddress && !!getSafeTokenAddress(chainId)
  const router = useRouter()
  const chain = useCurrentChain()
  const enableWc = !!chain && hasFeature(chain, FEATURES.NATIVE_WALLETCONNECT)

  // Logo link: if on Dashboard, link to Welcome, otherwise to the root (which redirects to either Dashboard or Welcome)
  const logoHref = router.pathname === AppRoutes.home ? AppRoutes.welcome.index : AppRoutes.index

  const handleMenuToggle = () => {
    if (onMenuToggle) {
      onMenuToggle((isOpen) => !isOpen)
    } else {
      void router.push(logoHref)
    }
  }

  const handleBatchToggle = () => {
    if (onBatchToggle) {
      onBatchToggle((isOpen) => !isOpen)
    }
  }

  return (
    <Paper className={css.container}>
      <div className={classnames(css.element, css.menuButton, !onMenuToggle ? css.hideSidebarMobile : null)}>
        <IconButton onClick={handleMenuToggle} size="large" edge="start" color="default" aria-label="menu">
          <MenuIcon />
        </IconButton>
      </div>

      <div className={classnames(css.element, css.hideMobile, css.logo)}>
        <Link href={logoHref} passHref>
          <SafeLogo alt="Safe logo" />
        </Link>
      </div>

      {showSafeToken && (
        <div className={classnames(css.element, css.hideMobile)}>
          <SafeTokenWidget />
        </div>
      )}

      <div className={css.element}>
        <PushNotificationsBanner>
          <NotificationCenter />
        </PushNotificationsBanner>
      </div>

      {safeAddress && (
        <div className={classnames(css.element, css.hideMobile)}>
          <BatchIndicator onClick={handleBatchToggle} />
        </div>
      )}

      {enableWc && (
        <div className={classnames(css.element, css.hideMobile)}>
          <WalletConnectUi />
        </div>
      )}

      <div className={classnames(css.element, css.connectWallet)}>
        <ConnectWallet />
      </div>

      <div className={classnames(css.element, css.networkSelector)}>
        <NetworkSelector />
      </div>
    </Paper>
  )
}

export default Header
