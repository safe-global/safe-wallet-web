import { Box, Typography } from '@mui/material'
import { Suspense } from 'react'
import type { ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import WalletIcon from '@/components/common/WalletIcon'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'

import css from './styles.module.css'
import Identicon from '@/components/common/Identicon'
import WalletBalance from '@/components/common/WalletBalance'
import { type BigNumber } from 'ethers'

export const UNKNOWN_CHAIN_NAME = 'Unknown'

export const WalletIdenticon = ({ wallet, size = 32 }: { wallet: ConnectedWallet; size?: number }) => {
  return (
    <Box className={css.imageContainer}>
      <Identicon address={wallet.address} size={size} />
      <Suspense>
        <Box className={css.walletIcon}>
          <WalletIcon provider={wallet.label} icon={wallet.icon} width={size / 2} height={size / 2} />
        </Box>
      </Suspense>
    </Box>
  )
}

const WalletInfo = ({
  wallet,
  balance,
  showBalance = false,
}: {
  wallet: ConnectedWallet
  balance?: BigNumber | undefined
  showBalance?: boolean
}): ReactElement => {
  const walletChain = useAppSelector((state) => selectChainById(state, wallet.chainId))
  const prefix = walletChain?.shortName

  return (
    <Box className={css.container}>
      <WalletIdenticon wallet={wallet} />

      <Box className={css.walletDetails}>
        <Typography variant="body2" component="div">
          {wallet.ens ? (
            <div>{wallet.ens}</div>
          ) : (
            <EthHashInfo
              showPrefix={false}
              prefix={prefix || ''}
              address={wallet.address}
              showName={false}
              showAvatar={false}
            />
          )}
        </Typography>

        {showBalance && (
          <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
            <Typography variant="caption" component="div" fontWeight="bold" className={css.balance}>
              <WalletBalance balance={balance} />
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default WalletInfo
