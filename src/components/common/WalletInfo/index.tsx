import { Box, Typography } from '@mui/material'
import { Suspense } from 'react'
import type { ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import WalletIcon from '@/components/common/WalletIcon'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'

import css from './styles.module.css'
import type { ConnectedWallet } from '@/hooks/wallets/useWallet'

export const UNKNOWN_CHAIN_NAME = 'Unknown'

const WalletInfo = ({ wallet }: { wallet: ConnectedWallet }): ReactElement => {
  const walletChain = useAppSelector((state) => selectChainById(state, wallet.chainId))
  const prefix = walletChain?.shortName

  return (
    <Box className={css.container}>
      <Box className={css.imageContainer}>
        <Suspense>
          <WalletIcon provider={wallet.label} />
        </Suspense>
      </Box>

      <Box className={css.walletDetails}>
        <Typography variant="caption" component="div" className={css.walletName}>
          {wallet.label} @ {walletChain?.chainName || UNKNOWN_CHAIN_NAME}
        </Typography>

        <Typography variant="caption" fontWeight="bold" component="div">
          <EthHashInfo prefix={prefix || ''} address={wallet.address} showName={false} showAvatar avatarSize={12} />
        </Typography>
      </Box>
    </Box>
  )
}

export default WalletInfo
