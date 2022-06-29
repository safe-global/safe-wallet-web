import { type ReactElement } from 'react'
import { Box, IconButton } from '@mui/material'
import css from './styles.module.css'
import MenuIcon from '@mui/icons-material/Menu'
import NetworkSelector from '@/components/common/NetworkSelector'
import ChainSwitcher from '@/components/common/ChainSwitcher'
import ConnectWallet from '@/components/common/ConnectWallet'

type HeaderProps = {
  onMenuToggle: () => void
}

const Header = ({ onMenuToggle }: HeaderProps): ReactElement => (
  <Box className={css.container} sx={{ backgroundColor: 'background.paper' }}>
    <div className={css.menuButton}>
      <IconButton onClick={onMenuToggle} size="large" edge="start" color="default" aria-label="menu" sx={{ mr: 2 }}>
        <MenuIcon />
      </IconButton>
    </div>

    <img src="/logo.svg" alt="Safe" className={css.logo} height={29} />

    <Box flexGrow={1} />

    <ChainSwitcher />

    <ConnectWallet />

    <NetworkSelector />
  </Box>
)

export default Header
