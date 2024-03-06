import EthHashInfo from '@/components/common/EthHashInfo'
import Identicon from '@/components/common/Identicon'
import SocialLoginInfo from '@/components/common/SocialLoginInfo'
import WalletBalance from '@/components/common/WalletBalance'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import { Box, Typography } from '@mui/material'
import { Suspense, type ReactElement } from 'react'
import WalletIcon from '../WalletIcon'
import css from './styles.module.css'

export const WalletIdenticon = ({ wallet, size = 32 }: { wallet: ConnectedWallet; size?: number }) => {
  return (
    <Box data-sid="73813" className={css.imageContainer}>
      <Identicon address={wallet.address} size={size} />
      <Suspense>
        <Box data-sid="66607" className={css.walletIcon}>
          <WalletIcon provider={wallet.label} icon={wallet.icon} width={size / 2} height={size / 2} />
        </Box>
      </Suspense>
    </Box>
  )
}

const WalletOverview = ({
  wallet,
  balance,
  showBalance,
}: {
  wallet: ConnectedWallet
  balance?: string
  showBalance?: boolean
}): ReactElement => {
  const walletChain = useAppSelector((state) => selectChainById(state, wallet.chainId))
  const prefix = walletChain?.shortName

  const isSocialLogin = isSocialLoginWallet(wallet.label)

  if (isSocialLogin) {
    return (
      <div data-sid="61503" className={css.socialLoginInfo}>
        <SocialLoginInfo
          wallet={wallet}
          chainInfo={walletChain}
          hideActions={true}
          balance={balance}
          showBalance={showBalance}
        />
      </div>
    )
  }

  return (
    <Box data-sid="62024" className={css.container}>
      <WalletIdenticon wallet={wallet} />

      <Box data-sid="63797" className={css.walletDetails}>
        <Typography variant="body2" component="div">
          {wallet.ens ? (
            <div>{wallet.ens}</div>
          ) : (
            <EthHashInfo
              prefix={prefix || ''}
              address={wallet.address}
              showName={false}
              showAvatar={false}
              avatarSize={12}
              copyAddress={false}
            />
          )}
        </Typography>

        {showBalance && (
          <Typography variant="caption" component="div" fontWeight="bold" display={{ xs: 'none', sm: 'block' }}>
            <WalletBalance balance={balance} />
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default WalletOverview
