import { type ReactElement } from 'react'
import { Box, Button, IconButton } from '@mui/material'
import css from './styles.module.css'
import MenuIcon from '@mui/icons-material/Menu'
import useOnboard from '@/services/wallets/useOnboard'
import useWallet from '@/services/wallets/useWallet'
import { shortenAddress } from '@/services/formatters'
import NetworkSelector from '@/components/common/NetworkSelector'
import { useCurrentChain } from '@/services/useChains'
import { hexValue } from '@ethersproject/bytes'

type HeaderProps = {
  onMenuToggle: () => void
}

const Header = ({ onMenuToggle }: HeaderProps): ReactElement => {
  const chain = useCurrentChain()
  const onboard = useOnboard()
  const wallet = useWallet()
  const isWrongChain = wallet && chain && wallet.chainId !== chain.chainId

  const handleChainSwitch = () => {
    const chainId = hexValue(parseInt(chain!.chainId))
    onboard?.setChain({ chainId })
  }

  return (
    <Box className={css.container} sx={{ backgroundColor: 'background.paper' }}>
      <div className={css.menuButton}>
        <IconButton onClick={onMenuToggle} size="large" edge="start" color="default" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
      </div>

      <img src="/logo.svg" alt="Safe" className={css.logo} />

      <Box sx={{ flexGrow: 1 }} />

      {isWrongChain && (
        <Button onClick={handleChainSwitch} variant="outlined" color="secondary" size="small">
          Switch to {chain?.chainName}
        </Button>
      )}

      {wallet ? (
        <Box sx={{ color: 'text.primary' }}>
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
        </Box>
      ) : (
        <Button onClick={() => onboard?.connectWallet()} variant="contained">
          Connect Wallet
        </Button>
      )}

      <NetworkSelector />
    </Box>
  )
}

export default Header
