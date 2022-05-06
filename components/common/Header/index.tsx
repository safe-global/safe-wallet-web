import { type ReactElement } from 'react'
import { AppBar, Box, Button, Grid, IconButton, Toolbar } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import useOnboard from '@/services/wallets/useOnboard'
import useWallet from '@/services/wallets/useWallet'
import { shortenAddress } from '@/services/formatters'
import css from './styles.module.css'

type HeaderProps = {
  onMenuToggle: () => void
}

const Header = ({ onMenuToggle }: HeaderProps): ReactElement => {
  const onboard = useOnboard()
  const wallet = useWallet()

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: (theme) => theme.palette.background.paper,
      }}
    >
      <Toolbar className={css.toolbar}>
        <div className={css.menuButton}>
          <IconButton onClick={onMenuToggle} size="large" edge="start" color="default" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        </div>

        <img src="/logo.svg" alt="Safe" className={css.logo} />

        <Box sx={{ flexGrow: 1 }} />

        {wallet ? (
          <div>
            {wallet.ens || shortenAddress(wallet.address)}
            <Button
              onClick={() =>
                onboard?.disconnectWallet({
                  label: wallet.label,
                })
              }
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={() => onboard?.connectWallet()} variant="contained">
            Connect Wallet
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header
