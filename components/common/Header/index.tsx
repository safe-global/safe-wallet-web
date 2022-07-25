import { type ReactElement } from 'react'
import { Box, IconButton, Paper } from '@mui/material'
import css from './styles.module.css'
import MenuIcon from '@mui/icons-material/Menu'
import NetworkSelector from '@/components/common/NetworkSelector'
import ChainSwitcher from '@/components/common/ChainSwitcher'
import ConnectWallet from '@/components/common/ConnectWallet'
import SafeLogo from '@/public/logo.svg'

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

    <SafeLogo alt="Safe Logo" className={css.logo} height={29} />

    <Box flexGrow={1} />

    <ChainSwitcher />

    <ConnectWallet />

    <NetworkSelector />
  </Paper>
)

export default Header
