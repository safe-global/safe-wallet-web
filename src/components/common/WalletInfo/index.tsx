import { Box, Typography } from '@mui/material'
import { Suspense } from 'react'
import type { ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import WalletIcon from '@/components/common/WalletIcon'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import css from './styles.module.css'

const WalletInfo = ({ wallet, chain }: { wallet: ConnectedWallet; chain: ChainInfo }): ReactElement => {
  return (
    <Box className={css.container}>
      <Box className={css.imageContainer}>
        <Suspense>
          <WalletIcon provider={wallet.label} />
        </Suspense>
      </Box>
      <Box>
        <Typography variant="caption" component="div" className={css.walletDetails}>
          {wallet.label} @ {chain.chainName}
        </Typography>
        <Typography variant="caption" fontWeight="bold">
          {wallet.ens ? (
            <div>{wallet.ens}</div>
          ) : (
            <EthHashInfo
              prefix={chain.shortName}
              address={wallet.address}
              showName={false}
              showAvatar
              avatarSize={12}
            />
          )}
        </Typography>
      </Box>
    </Box>
  )
}

export default WalletInfo
