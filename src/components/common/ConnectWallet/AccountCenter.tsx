import type { MouseEvent } from 'react'
import { useState } from 'react'
import { Box, Button, ButtonBase, Paper, Popover, Typography } from '@mui/material'
import css from '@/components/common/ConnectWallet/styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useOnboard, { forgetLastWallet, switchWallet } from '@/hooks/wallets/useOnboard'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import Identicon from '@/components/common/Identicon'
import ChainSwitcher from '../ChainSwitcher'
import useAddressBook from '@/hooks/useAddressBook'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import WalletInfo, { UNKNOWN_CHAIN_NAME } from '../WalletInfo'

const AccountCenter = ({ wallet }: { wallet: ConnectedWallet }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const onboard = useOnboard()
  const chainInfo = useAppSelector((state) => selectChainById(state, wallet.chainId))
  const addressBook = useAddressBook()
  const prefix = chainInfo?.shortName

  const handleSwitchWallet = () => {
    if (onboard) {
      handleClose()
      switchWallet(onboard)
    }
  }

  const handleDisconnect = () => {
    if (!wallet) return

    onboard?.disconnectWallet({
      label: wallet.label,
    })

    forgetLastWallet()
    handleClose()
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <>
      <ButtonBase onClick={handleClick} aria-describedby={id} disableRipple sx={{ alignSelf: 'stretch' }}>
        <Box className={css.buttonContainer}>
          <WalletInfo wallet={wallet} />

          <Box display="flex" alignItems="center" justifyContent="flex-end" marginLeft="auto">
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
        sx={{ marginTop: 1 }}
      >
        <Paper className={css.popoverContainer}>
          <Identicon address={wallet.address} />

          <Typography variant="h5" className={css.addressName}>
            {addressBook[wallet.address] || wallet.ens}
          </Typography>

          <Box bgcolor="border.background" px={2} py={1} fontSize={14}>
            <EthHashInfo
              address={wallet.address}
              showAvatar={false}
              showName={false}
              hasExplorer
              showCopyButton
              prefix={prefix}
            />
          </Box>

          <Box className={css.rowContainer}>
            <Box className={css.row}>
              <Typography variant="caption">Wallet</Typography>
              <Typography variant="body2">{wallet.label}</Typography>
            </Box>
            <Box className={css.row}>
              <Typography variant="caption">Connected network</Typography>
              <Typography variant="body2">{chainInfo?.chainName || UNKNOWN_CHAIN_NAME}</Typography>
            </Box>
          </Box>

          <ChainSwitcher fullWidth />

          <Button
            variant="contained"
            size="small"
            onClick={handleSwitchWallet}
            fullWidth
            sx={{ display: ['none', 'block'] }}
          >
            Switch wallet
          </Button>

          <Button onClick={handleDisconnect} variant="danger" size="small" fullWidth disableElevation>
            Disconnect
          </Button>
        </Paper>
      </Popover>
    </>
  )
}

export default AccountCenter
