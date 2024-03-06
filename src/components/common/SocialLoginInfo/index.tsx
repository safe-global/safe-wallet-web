import CopyAddressButton from '@/components/common/CopyAddressButton'
import ExplorerButton from '@/components/common/ExplorerButton'
import WalletBalance from '@/components/common/WalletBalance'
import useSocialWallet from '@/hooks/wallets/mpc/useSocialWallet'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { getBlockExplorerLink } from '@/utils/chains'
import { Badge, Box, Typography } from '@mui/material'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'

const SocialLoginInfo = ({
  wallet,
  chainInfo,
  hideActions = false,
  size = 28,
  balance,
  showBalance,
}: {
  wallet: ConnectedWallet
  chainInfo?: ChainInfo
  hideActions?: boolean
  size?: number
  balance?: string
  showBalance?: boolean
}) => {
  const socialWalletService = useSocialWallet()
  const userInfo = socialWalletService?.getUserInfo()
  const prefix = chainInfo?.shortName
  const link = chainInfo ? getBlockExplorerLink(chainInfo, wallet.address) : undefined
  const settings = useAppSelector(selectSettings)

  if (!userInfo) return <></>

  return (
    <Box data-sid="84550" width="100%" display="flex" flexDirection="row" alignItems="center" gap={1}>
      <Box data-sid="42488" position="relative">
        <img
          src={userInfo.profileImage}
          className={css.profileImg}
          alt="Profile Image"
          referrerPolicy="no-referrer"
          width={size}
          height={size}
        />
        {!socialWalletService?.isMFAEnabled() && <Badge variant="dot" color="warning" className={css.bubble} />}
      </Box>
      <div data-sid="47853" className={css.profileData}>
        <Typography className={css.text} variant="body2">
          {userInfo.name}
        </Typography>
        {showBalance ? (
          <Typography variant="caption" component="div" fontWeight="bold" display={{ xs: 'none', sm: 'block' }}>
            <WalletBalance balance={balance} />
          </Typography>
        ) : (
          <Typography className={css.text} variant="body2">
            {userInfo.email}
          </Typography>
        )}
      </div>
      {!hideActions && (
        <div data-sid="92477" className={css.actionButtons}>
          <Box data-sid="91273" color="border.main">
            <CopyAddressButton prefix={prefix} copyPrefix={settings.shortName.copy} address={wallet.address} />
            <ExplorerButton title={link?.title || ''} href={link?.href || ''} />
          </Box>
        </div>
      )}
    </Box>
  )
}

export default SocialLoginInfo
