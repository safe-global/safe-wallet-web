import ChainSwitcher from '@/components/common/ChainSwitcher'
import ConnectWallet from '@/components/common/ConnectWallet'
import NetworkSelector from '@/components/common/NetworkSelector'
import SafeTokenWidget from '@/components/common/SafeTokenWidget'
import NotificationCenter from '@/components/notification-center/NotificationCenter'
import SafeLogo from '@/public/logo.svg'
import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, IconButton, Toolbar } from '@mui/material'
import { type ReactElement } from 'react'
import css from './styles.module.css'

type HeaderProps = {
  onMenuToggle: () => void
}

const Header = ({ onMenuToggle }: HeaderProps): ReactElement => (
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

      <div className={css.tokenWidget}>
        <SafeTokenWidget />
      </div>

      <div className={css.notificationCenter}>
        <NotificationCenter />
      </div>

      <div>
        <ConnectWallet />
      </div>

      <div>
        <NetworkSelector />
      </div>
    </Toolbar>
  </AppBar>
)

export default Header
