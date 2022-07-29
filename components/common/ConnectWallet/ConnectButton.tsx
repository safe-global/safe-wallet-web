import { Box, Button, ButtonBase, Paper, Popover, Typography } from '@mui/material'
import css from '@/components/common/ConnectWallet/styles.module.css'
import KeyholeImage from '@/public/keyhole.svg'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { MouseEvent, useState } from 'react'
import useOnboard from '@/hooks/wallets/useOnboard'

export const ConnectButton = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const onboard = useOnboard()

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleConnect = () => {
    handleClose()
    onboard?.connectWallet()
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <>
      <ButtonBase onClick={handleClick} aria-describedby={id} disableRipple sx={{ alignSelf: 'stretch' }}>
        <Box className={css.buttonContainer}>
          <Box className={css.imageContainer}>
            <KeyholeImage />
            <FiberManualRecordIcon className={css.dot} color="error" fontSize="inherit" />
          </Box>
          <Box>
            <Typography variant="caption" fontWeight="bold" component="div" className={css.notConnected}>
              Not connected
            </Typography>
            <Typography variant="caption" color="error" component="div" className={css.connectWallet}>
              Connect wallet
            </Typography>
          </Box>
          <Box justifySelf="flex-end" marginLeft="auto">
            {open ? <ExpandLessIcon color="border" /> : <ExpandMoreIcon color="border" />}
          </Box>
        </Box>
      </ButtonBase>
      <Popover
        id={id}
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
        sx={{ marginTop: 1 }}
      >
        <Paper className={css.popoverContainer}>
          <Typography variant="h5">Connect a wallet</Typography>
          <Box className={css.imageContainer}>
            <KeyholeImage />
            <FiberManualRecordIcon className={css.dot} color="error" fontSize="inherit" />
          </Box>
          <Button onClick={handleConnect} variant="contained" size="small" fullWidth disableElevation>
            Connect
          </Button>
        </Paper>
      </Popover>
    </>
  )
}
