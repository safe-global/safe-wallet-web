import { Box, Typography } from '@mui/material'
import { Suspense } from 'react'
import type { ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import WalletIcon from '@/components/common/WalletIcon'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'

import css from './styles.module.css'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/module'
import SocialLoginInfo from '@/components/common/SocialLoginInfo'

export const UNKNOWN_CHAIN_NAME = 'Unknown'

const WalletInfo = ({ wallet }: { wallet: ConnectedWallet }): ReactElement => {
  const walletChain = useAppSelector((state) => selectChainById(state, wallet.chainId))
  const prefix = walletChain?.shortName

  const isSocialLogin = wallet.label === ONBOARD_MPC_MODULE_LABEL

  if (isSocialLogin) {
    return (
      <div className={css.socialLoginInfo}>
        <SocialLoginInfo wallet={wallet} chainInfo={walletChain} hideActions={true} />
      </div>
    )
  }

  return (
    <Box className={css.container}>
      <Box className={css.imageContainer}>
        <Suspense>
          <WalletIcon provider={wallet.label} icon={wallet.icon} />
        </Suspense>
      </Box>

      <Box className={css.walletDetails}>
        <Typography variant="caption" component="div" className={css.walletName}>
          {wallet.label} @ {walletChain?.chainName || UNKNOWN_CHAIN_NAME}
        </Typography>

        <Typography variant="caption" fontWeight="bold" component="div">
          {wallet.ens ? (
            <div>{wallet.ens}</div>
          ) : (
            <EthHashInfo prefix={prefix || ''} address={wallet.address} showName={false} showAvatar avatarSize={12} />
          )}
        </Typography>
      </Box>
    </Box>
  )
}

export default WalletInfo
