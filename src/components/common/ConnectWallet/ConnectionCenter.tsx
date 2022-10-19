import { Popover, ButtonBase, Typography, Paper, Divider, Box } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useState, type MouseEvent, type ReactElement } from 'react'

import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
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

        <ExpandIcon color="border" />
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
        sx={{ mt: 1 }}
      >
        <Paper className={css.popoverContainer}>
          <WalletDetails onConnect={handleClose} />

          {isSupported && (
            <Box className={css.pairingDetails}>
              <Divider flexItem />

              <PairingDetails vertical />
            </Box>
          )}
        </Paper>
      </Popover>
    </>
  )
}

export default ConnectionCenter
