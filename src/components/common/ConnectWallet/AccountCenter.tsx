import type { MouseEvent } from 'react'
import { useState } from 'react'
import { Box, Button, ButtonBase, Paper, Popover, Typography } from '@mui/material'
import css from '@/components/common/ConnectWallet/styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useOnboard, { switchWallet } from '@/hooks/wallets/useOnboard'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import ChainSwitcher from '../ChainSwitcher'
import useAddressBook from '@/hooks/useAddressBook'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import WalletInfo, { UNKNOWN_CHAIN_NAME, WalletIdenticon } from '../WalletInfo'
import useWalletBalance from '@/hooks/wallets/useWalletBalance'
import WalletBalance from '@/components/common/WalletBalance'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'

const AccountCenter = ({ wallet }: { wallet: ConnectedWallet }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const onboard = useOnboard()
  const chainInfo = useAppSelector((state) => selectChainById(state, wallet.chainId))
  const addressBook = useAddressBook()
  const [balance] = useWalletBalance()
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
          <WalletInfo wallet={wallet} balance={balance} showBalance />

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
        sx={{
          '& > .MuiPaper-root': {
            top: 'var(--header-height) !important',
          },
        }}
      >
        <Paper className={css.popoverContainer}>
          <Box display="flex" gap="12px">
            <WalletIdenticon wallet={wallet} size={36} />
            <Typography variant="body2" className={css.address}>
              <EthHashInfo
                address={wallet.address}
                name={addressBook[wallet.address] || wallet.ens || wallet.label}
                showAvatar={false}
                showPrefix={false}
                hasExplorer
                showCopyButton
                prefix={prefix}
              />
            </Typography>
          </Box>

          <Box className={css.rowContainer}>
            <Box className={css.row}>
              <Typography variant="body2" color="primary.light">
                Balance
              </Typography>
              <Typography variant="body2">
                <WalletBalance balance={balance} />
              </Typography>
            </Box>
            <Box className={css.row}>
              <Typography variant="body2" color="primary.light">
                Wallet
              </Typography>
              <Typography variant="body2">{wallet.label}</Typography>
            </Box>
            <Box className={css.row}>
              <Typography variant="body2" color="primary.light">
                Network
              </Typography>
              <Typography variant="body2">{chainInfo?.chainName || UNKNOWN_CHAIN_NAME}</Typography>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <ChainSwitcher fullWidth />

            <Button variant="contained" size="small" onClick={handleSwitchWallet} fullWidth>
              Switch wallet
            </Button>

            <Button
              onClick={handleDisconnect}
              variant="danger"
              size="small"
              fullWidth
              disableElevation
              startIcon={<PowerSettingsNewIcon />}
            >
              Disconnect
            </Button>
          </Box>
        </Paper>
      </Popover>
    </>
  )
}

export default AccountCenter
