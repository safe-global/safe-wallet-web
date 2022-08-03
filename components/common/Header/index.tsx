import ChainSwitcher from '@/components/common/ChainSwitcher'
import ConnectWallet from '@/components/common/ConnectWallet'
import NetworkSelector from '@/components/common/NetworkSelector'
import SafeTokenWidget from '@/components/common/SafeTokenWidget'
import SafeLogo from '@/public/logo.svg'
import MenuIcon from '@mui/icons-material/Menu'
import { IconButton, Paper } from '@mui/material'
import { type ReactElement } from 'react'
import css from './styles.module.css'

type HeaderProps = {
  onMenuToggle: () => void
}

const Header = ({ onMenuToggle }: HeaderProps): ReactElement => (
  <Paper className={css.container} elevation={1}>
    <div className={css.menuButton}>
      <IconButton onClick={onMenuToggle} size="large" edge="start" color="default" aria-label="menu" sx={{ mr: 2 }}>
        <MenuIcon />
      </IconButton>
    </div>

    <div className={css.logo}>
      <SafeLogo alt="Safe Logo" height={29} />
    </div>

    <div className={css.chainSwitcher}>
      <ChainSwitcher />
    </div>

    <div className={css.tokenWidget}>
      <SafeTokenWidget />
    </div>

    <ConnectWallet />

    <NetworkSelector loadLastSafe />
  </Paper>
)

export default Header
