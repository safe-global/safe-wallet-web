import ChainSwitcher from '@/components/common/ChainSwitcher'
import ConnectWallet from '@/components/common/ConnectWallet'
import NetworkSelector from '@/components/common/NetworkSelector'
import SafeTokenWidget, { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import NotificationCenter from '@/components/notification-center/NotificationCenter'
import useChainId from '@/hooks/useChainId'
import SafeLogo from '@/public/logo.svg'
import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, Box, IconButton, Toolbar } from '@mui/material'
import classnames from 'classnames'
import { type ReactElement } from 'react'
import css from './styles.module.css'

type HeaderProps = {
  onMenuToggle: () => void
}

const Header = ({ onMenuToggle }: HeaderProps): ReactElement => {
  const chainId = useChainId()

  return (
    <AppBar component="header" sx={{ zIndex: ({ zIndex }) => zIndex.drawer + 1 }} className={css.container}>
      <Toolbar className={css.header}>
        <div className={css.menuButton}>
          <IconButton onClick={onMenuToggle} size="large" edge="start" color="default" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        </div>

        <div className={css.logo}>
          <SafeLogo alt="Safe Logo" height={29} className={css.logo} />
        </div>

        <div className={css.chainSwitcher}>
          <ChainSwitcher />
        </div>

        {!!getSafeTokenAddress(chainId) && (
          <div className={classnames(css.tokenWidget, css.element)}>
            <SafeTokenWidget />
          </div>
        )}

        <div className={classnames(css.element, css.notificationCenter)}>
          <NotificationCenter />
        </div>

        <div className={css.element}>
          <ConnectWallet />
        </div>

        <Box className={css.element} sx={{ pr: '0 !important' }}>
          <NetworkSelector />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
