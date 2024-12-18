import ConnectWalletButton from '@/components/common/ConnectWallet/ConnectWalletButton'
import { Box } from '@mui/material'
import { type ReactElement } from 'react'
import css from '@/components/common/ConnectWallet/styles.module.css'

const ConnectionCenter = (): ReactElement => {
  return (
    <Box className={css.buttonContainer}>
      <ConnectWalletButton small={true} />
    </Box>
  )
}

export default ConnectionCenter
