import { Box, Typography } from '@mui/material'
import css from './styles.module.css'
import { useContext } from 'react'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type ConnectedWallet } from '@/services/onboard'
import { MpcWalletContext } from '@/components/common/ConnectWallet/MPCWalletProvider'
import CopyAddressButton from '@/components/common/CopyAddressButton'
import ExplorerButton from '@/components/common/ExplorerButton'
import { getBlockExplorerLink } from '@/utils/chains'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'

const SocialLoginInfo = ({
  wallet,
  chainInfo,
  hideActions = false,
}: {
  wallet: ConnectedWallet
  chainInfo?: ChainInfo
  hideActions?: boolean
}) => {
  const { userInfo } = useContext(MpcWalletContext)
  const prefix = chainInfo?.shortName
  const link = chainInfo ? getBlockExplorerLink(chainInfo, wallet.address) : undefined
  const settings = useAppSelector(selectSettings)

  if (!userInfo) return <></>

  return (
    <Box width="100%" display="flex" flexDirection="row" alignItems="center" gap={1}>
      <img src={userInfo.profileImage} className={css.profileImg} alt="Profile Image" referrerPolicy="no-referrer" />
      <div className={css.profileData}>
        <Typography className={css.text} variant="body2" fontWeight={700}>
          {userInfo.name}
        </Typography>
        <Typography className={css.text} variant="body2">
          {userInfo.email}
        </Typography>
      </div>
      {!hideActions && (
        <div className={css.actionButtons}>
          <Box color="border.main">
            <CopyAddressButton prefix={prefix} copyPrefix={settings.shortName.copy} address={wallet.address} />
            <ExplorerButton title={link?.title || ''} href={link?.href || ''} />
          </Box>
        </div>
      )}
    </Box>
  )
}

export default SocialLoginInfo
