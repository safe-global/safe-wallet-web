import { type ReactElement } from 'react'
import { AppBar, Button, Grid, Toolbar } from '@mui/material'
import useOnboard from '@/services/wallets/useOnboard'
import useWallet from '@/services/wallets/useWallet'
import { shortenAddress } from '@/services/formatters'
import css from './styles.module.css'

const Header = (): ReactElement => {
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
      <Toolbar>
        <Grid container>
          <Grid item xs={3}>
            <img src="/logo.svg" alt="Safe" className={css.logo} />
          </Grid>

          <Grid item xs />

          <Grid item xs />
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
        </Grid>
      </Toolbar>
    </AppBar>
  )
}

export default Header
