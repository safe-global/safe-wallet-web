import { MouseEvent, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Box, Button, ButtonBase, Paper, Popover, Typography } from '@mui/material'
import css from '@/components/common/ConnectWallet/styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useOnboard, { lastWalletStorage } from '@/hooks/wallets/useOnboard'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import Identicon from '@/components/common/Identicon'
import ChainSwitcher from '../ChainSwitcher'
import useAddressBook from '@/hooks/useAddressBook'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'

const WalletIcon = dynamic(() => import('@/components/common/WalletIcon'))

const AccountCenter = ({ wallet }: { wallet: ConnectedWallet }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const onboard = useOnboard()
  const chainId = useChainId()
  const chainInfo = useAppSelector((state) => selectChainById(state, chainId))
  const addressBook = useAddressBook()

  const handleDisconnect = () => {
    if (!wallet) return

    onboard?.disconnectWallet({
      label: wallet.label,
    })

    lastWalletStorage.remove()
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
          <Box className={css.imageContainer}>
            <Suspense>
              <WalletIcon provider={wallet.label} />
            </Suspense>
          </Box>

          <Box>
            <Typography variant="caption" component="div" className={css.walletDetails}>
              {wallet.label} @ {chainInfo?.chainName}
            </Typography>

            <Typography variant="caption" fontWeight="bold" className={css.address}>
              {wallet.ens || <EthHashInfo address={wallet.address} showName={false} showAvatar avatarSize={12} />}
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
          <Identicon address={wallet.address} />

          <Typography variant="h5">{addressBook?.[wallet.address] || wallet.ens}</Typography>

          <Box bgcolor="border.background" px={2} py={1} fontSize={14}>
            <EthHashInfo address={wallet.address} showAvatar={false} showName={false} hasExplorer showCopyButton />
          </Box>

          <Box className={css.rowContainer}>
            <Box className={css.row}>
              <Typography variant="caption">Wallet</Typography>
              <Typography variant="body2">{wallet.label}</Typography>
            </Box>
            <Box className={css.row}>
              <Typography variant="caption">Connected network</Typography>
              <Typography variant="body2">{chainInfo?.chainName}</Typography>
            </Box>
          </Box>

          <ChainSwitcher fullWidth />

          <Button onClick={handleDisconnect} color="error" variant="contained" size="small" fullWidth disableElevation>
            Disconnect
          </Button>
        </Paper>
      </Popover>
    </>
  )
}

export default AccountCenter
