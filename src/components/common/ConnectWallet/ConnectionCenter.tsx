import { Popover, ButtonBase, Typography, Paper } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { useState, type MouseEvent, type ReactElement } from 'react'

import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import WalletDetails from '@/components/common/ConnectWallet/WalletDetails'

import css from '@/components/common/ConnectWallet/styles.module.css'

const ConnectionCenter = (): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = !!anchorEl

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

        <Typography variant="caption" className={css.notConnected}>
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
        </Paper>
      </Popover>
    </>
  )
}

export default ConnectionCenter
