import { Popover, ButtonBase, Typography, Paper, Divider } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useState, type MouseEvent, type ReactElement } from 'react'

import KeyholeIcon from '@/components/common/ConnectWallet/KeyholeIcon'
import WalletDetails from '@/components/common/ConnectWallet/WalletDetails'
import PairingDetails from '@/components/common/PairingDetails'

import css from '@/components/common/ConnectWallet/styles.module.css'
import { useCurrentChain } from '@/hooks/useChains'
import { isPairingSupported } from '@/services/pairing/utils'

const ConnectionCenter = (): ReactElement => {
  const chain = useCurrentChain()

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = !!anchorEl

  const isSupported = isPairingSupported(chain?.disabledWallets)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const ExpandIcon = open ? ExpandLessIcon : ExpandMoreIcon

  return (
    <>
      <ButtonBase disableRipple onClick={handleClick} className={css.buttonContainer}>
        <KeyholeIcon />

        <Typography variant="caption">
          <b>Not connected</b>
          <br />
          <Typography variant="inherit" sx={{ color: ({ palette }) => palette.error.main }}>
            Connect wallet
          </Typography>
        </Typography>

        <ExpandIcon sx={({ palette }) => ({ color: palette.secondary.light })} />
      </ButtonBase>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        elevation={3}
        sx={{ mt: 1 }}
      >
        <Paper className={css.popoverContainer}>
          <WalletDetails onConnect={handleClose} />

          {isSupported && (
            <>
              <Divider flexItem />

              <PairingDetails vertical />
            </>
          )}
        </Paper>
      </Popover>
    </>
  )
}

export default ConnectionCenter
