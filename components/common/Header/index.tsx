import { type ReactElement } from 'react'
import { Button } from '@mui/material'
import css from './styles.module.css'
import useOnboard from '@/services/wallets/useOnboard'
import useWallet from '@/services/wallets/useWallet'
import { shortenAddress } from '@/services/formatters'

const Header = (): ReactElement => {
  const onboard = useOnboard()
  const wallet = useWallet()

  return (
    <header className={css.container}>
      <img src="/logo.svg" alt="Safe" />

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
    </header>
  )
}

export default Header
