import { ReactElement, useState, MouseEvent } from 'react'
import { Button, Box, Popover, ButtonBase, Typography, IconButton } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import useOnboard from '@/hooks/wallets/useOnboard'
import useWallet from '@/hooks/wallets/useWallet'
import EthHashInfo from '../EthHashInfo'
import css from './styles.module.css'
import KeyholeImage from '@/public/keyhole.svg'

const ConnectWallet = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const wallet = useWallet()
  const onboard = useOnboard()

  const handleConnect = () => {
    onboard?.connectWallet()
  }

  const handleDisconnect = () => {
    if (!wallet) return

    onboard?.disconnectWallet({
      label: wallet.label,
    })
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return wallet ? (
    <div className={css.connectedContainer}>
      <Box fontSize="10px">
        <EthHashInfo address={wallet.address} name={wallet.ens} />
      </Box>

      <Button onClick={handleDisconnect} size="small" variant="text" sx={{ fontWeight: 'normal', marginLeft: 1 }}>
        Disconnect
      </Button>
    </div>
  ) : (
    <>
      <ButtonBase onClick={handleClick} disableRipple sx={{ alignSelf: 'stretch' }}>
        <Box className={css.buttonContainer}>
          <KeyholeImage />
          <Box>
            <Typography variant="caption" fontWeight="bold" component="div">
              Not connected
            </Typography>
            <Typography variant="caption" color="error" component="div">
              Connect Wallet
            </Typography>
          </Box>
          <IconButton size="small" disableRipple>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </ButtonBase>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Button onClick={handleConnect} variant="contained" size="small">
          Connect Wallet
        </Button>
      </Popover>
    </>
  )
}

export default ConnectWallet
