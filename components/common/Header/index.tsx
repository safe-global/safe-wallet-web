import { type ReactElement } from 'react'
import { Box, Button, IconButton } from '@mui/material'
import css from './styles.module.css'
import MenuIcon from '@mui/icons-material/Menu'
import useOnboard from '@/hooks/wallets/useOnboard'
import useWallet, { useIsWrongChain } from '@/hooks/wallets/useWallet'
import { shortenAddress } from '@/utils/formatters'
import NetworkSelector from '@/components/common/NetworkSelector'
import { useCurrentChain } from '@/hooks/useChains'
import { hexValue } from '@ethersproject/bytes'

type HeaderProps = {
  onMenuToggle: () => void
}

const Header = ({ onMenuToggle }: HeaderProps): ReactElement => {
  const chain = useCurrentChain()
  const onboard = useOnboard()
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()

  const handleChainSwitch = () => {
    if (!chain) return
    const chainId = hexValue(parseInt(chain.chainId))
    onboard?.setChain({ chainId })
  }

  const handleConnect = () => {
    onboard?.connectWallet()
  }

  const handleDisconnect = () => {
    if (!wallet) return

    onboard?.disconnectWallet({
      label: wallet.label,
    })
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

          <Button onClick={handleDisconnect}>Disconnect</Button>
        </Box>
      ) : (
        <Button onClick={handleConnect} variant="contained">
          Connect Wallet
        </Button>
      )}

      <NetworkSelector />
    </Box>
  )
}

export default Header
