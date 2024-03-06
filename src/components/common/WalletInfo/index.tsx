import ChainSwitcher from '@/components/common/ChainSwitcher'
import EthHashInfo from '@/components/common/EthHashInfo'
import SocialLoginInfo from '@/components/common/SocialLoginInfo'
import WalletBalance from '@/components/common/WalletBalance'
import { WalletIdenticon } from '@/components/common/WalletOverview'
import { IS_PRODUCTION } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import useSocialWallet from '@/hooks/wallets/mpc/useSocialWallet'
import useOnboard, { switchWallet, type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import LockIcon from '@/public/images/common/lock-small.svg'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import madProps from '@/utils/mad-props'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import { Box, Button, Typography } from '@mui/material'
import { useParticleConnect } from '@particle-network/connectkit'
import Link from 'next/link'
import { useRouter } from 'next/router'
import css from './styles.module.css'

type WalletInfoProps = {
  wallet: ConnectedWallet
  balance?: string | bigint
  currentChainId: ReturnType<typeof useChainId>
  socialWalletService: ReturnType<typeof useSocialWallet>
  router: ReturnType<typeof useRouter>
  onboard: ReturnType<typeof useOnboard>
  addressBook: ReturnType<typeof useAddressBook>
  handleClose: () => void
}

export const WalletInfo = ({
  wallet,
  balance,
  currentChainId,
  socialWalletService,
  router,
  onboard,
  addressBook,
  handleClose,
}: WalletInfoProps) => {
  const chainInfo = useAppSelector((state) => selectChainById(state, wallet.chainId))
  const prefix = chainInfo?.shortName

  const { disconnect: evmDisconnect } = useParticleConnect()

  const handleSwitchWallet = () => {
    if (onboard) {
      handleClose()
      switchWallet(onboard)
    }
  }

  const resetAccount = () => socialWalletService?.__deleteAccount()

  const handleDisconnect = () => {
    evmDisconnect()
      .then(() => {
        location.replace('/')
      })
      .catch((e) => {
        console.error('Failed to disconnect wallet', e)
      })
    handleClose()
  }

  const isSocialLogin = isSocialLoginWallet(wallet.label)

  return (
    <>
      <Box data-sid="81448" display="flex" gap="12px">
        {isSocialLogin ? (
          <Box>
            <SocialLoginInfo wallet={wallet} chainInfo={chainInfo} size={36} />

            {socialWalletService && !socialWalletService.isMFAEnabled() && (
              <Link href={{ pathname: AppRoutes.settings.securityLogin, query: router.query }} passHref>
                <Button
                  data-sid="47897"
                  fullWidth
                  variant="contained"
                  color="warning"
                  className={css.warningButton}
                  disableElevation
                  startIcon={<LockIcon />}
                  sx={{ mt: 1, p: 1 }}
                  onClick={handleClose}
                >
                  Add multifactor authentication
                </Button>
              </Link>
            )}
          </Box>
        ) : (
          <>
            <WalletIdenticon wallet={wallet} size={36} />
            <Typography variant="body2" className={css.address}>
              <EthHashInfo
                address={wallet.address}
                name={addressBook[wallet.address] || wallet.ens || wallet.label}
                showAvatar={false}
                showPrefix={false}
                hasExplorer
                showCopyButton
                prefix={prefix}
              />
            </Typography>
          </>
        )}
      </Box>

      <Box data-sid="79935" className={css.rowContainer}>
        <Box data-sid="76014" className={css.row}>
          <Typography variant="body2" color="primary.light">
            Wallet
          </Typography>
          <Typography variant="body2">{wallet.label}</Typography>
        </Box>

        <Box data-sid="15629" className={css.row}>
          <Typography variant="body2" color="primary.light">
            Balance
          </Typography>
          <Typography variant="body2" textAlign="right">
            {!!chainInfo?.chainName && <WalletBalance balance={balance} />}

            {currentChainId !== chainInfo?.chainId && (
              <>
                <Typography variant="body2" color="primary.light">
                  ({chainInfo?.chainName || 'Unknown chain'})
                </Typography>
              </>
            )}
          </Typography>
        </Box>
      </Box>

      <Box data-sid="77746" display="flex" flexDirection="column" gap={2} width={1}>
        <ChainSwitcher fullWidth />

        {/* <Button data-sid="15983"    variant="contained" size="small" onClick={handleSwitchWallet} fullWidth>
          Switch wallet ！！！！
        </Button> */}

        <Button
          data-sid="40680"
          onClick={handleDisconnect}
          variant="danger"
          size="small"
          fullWidth
          disableElevation
          startIcon={<PowerSettingsNewIcon />}
        >
          Disconnect
        </Button>

        {!IS_PRODUCTION && isSocialLogin && (
          <Button data-sid="62748" onClick={resetAccount} variant="danger" size="small" fullWidth disableElevation>
            Delete account
          </Button>
        )}
      </Box>
    </>
  )
}

export default madProps(WalletInfo, {
  socialWalletService: useSocialWallet,
  router: useRouter,
  onboard: useOnboard,
  addressBook: useAddressBook,
  currentChainId: useChainId,
})
