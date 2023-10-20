import { Box, Skeleton, Typography } from '@mui/material'
import { Suspense } from 'react'
import type { ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import WalletIcon from '@/components/common/WalletIcon'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'

import css from './styles.module.css'
import useWalletBalance from '@/hooks/wallets/useWalletBalance'
import { formatVisualAmount } from '@/utils/formatters'

export const UNKNOWN_CHAIN_NAME = 'Unknown'

const WalletInfo = ({ wallet }: { wallet: ConnectedWallet }): ReactElement => {
  const walletChain = useAppSelector((state) => selectChainById(state, wallet.chainId))
  const prefix = walletChain?.shortName
  const [balance, balanceError, balanceLoading] = useWalletBalance()

  return (
    <Box className={css.container}>
      <Box className={css.imageContainer}>
        <Suspense>
          <WalletIcon provider={wallet.label} icon={wallet.icon} />
        </Suspense>{' '}
      </Box>

      <Box className={css.walletDetails}>
        <Typography variant="caption" fontWeight="bold" component="div">
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

        <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
          <Typography variant="caption" component="div" className={css.balance}>
            {balance !== undefined ? (
              <>
                {' '}
                {formatVisualAmount(balance.toString(10), walletChain?.nativeCurrency.decimals ?? 18)}{' '}
                {walletChain?.nativeCurrency.symbol ?? 'ETH'}
              </>
            ) : (
              <Skeleton />
            )}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default WalletInfo
