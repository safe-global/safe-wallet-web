import { Box, Button } from '@mui/material'
import css from './styles.module.css'
import ChainIndicator from '@/components/common/ChainIndicator'
import SocialLoginInfo from '@/components/common/SocialLoginInfo'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import LockIcon from '@/public/images/common/lock-small.svg'
import EthHashInfo from '@/components/common/EthHashInfo'
import ChainSwitcher from '@/components/common/ChainSwitcher'
import { IS_PRODUCTION } from '@/config/constants'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import useOnboard, { type ConnectedWallet, switchWallet } from '@/hooks/wallets/useOnboard'
import { useRouter } from 'next/router'
import useAddressBook from '@/hooks/useAddressBook'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import madProps from '@/utils/mad-props'
import useSocialWallet from '@/hooks/wallets/mpc/useSocialWallet'

type WalletInfoProps = {
  wallet: ConnectedWallet
  socialWalletService: ReturnType<typeof useSocialWallet>
  router: ReturnType<typeof useRouter>
  onboard: ReturnType<typeof useOnboard>
  addressBook: ReturnType<typeof useAddressBook>
  handleClose: () => void
}

export const WalletInfo = ({
  wallet,
  socialWalletService,
  router,
  onboard,
  addressBook,
  handleClose,
}: WalletInfoProps) => {
  const chainInfo = useAppSelector((state) => selectChainById(state, wallet.chainId))
  const prefix = chainInfo?.shortName

  const handleSwitchWallet = () => {
    if (onboard) {
      handleClose()
      switchWallet(onboard)
    }
  }

  const resetAccount = () => socialWalletService?.__deleteAccount()

  const handleDisconnect = () => {
    if (!wallet) return

    onboard?.disconnectWallet({
      label: wallet.label,
    })

    handleClose()
  }

  const isSocialLogin = isSocialLoginWallet(wallet.label)

  return (
    <Box className={css.container}>
      <Box className={css.accountContainer}>
        <ChainIndicator />

        <Box className={css.addressContainer}>
          {isSocialLogin ? (
            <>
              <SocialLoginInfo wallet={wallet} chainInfo={chainInfo} />
              {socialWalletService && !socialWalletService.isMFAEnabled() && (
                <Link href={{ pathname: AppRoutes.settings.securityLogin, query: router.query }} passHref>
                  <Button
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
            </>
          ) : (
            <EthHashInfo
              address={wallet.address}
              name={addressBook[wallet.address] || wallet.ens}
              hasExplorer
              showCopyButton
              prefix={prefix}
              avatarSize={32}
            />
          )}
        </Box>
      </Box>

      <ChainSwitcher fullWidth />

      <Button variant="contained" size="small" onClick={handleSwitchWallet} fullWidth>
        Switch wallet
      </Button>

      <Button onClick={handleDisconnect} variant="danger" size="small" fullWidth disableElevation>
        Disconnect
      </Button>

      {!IS_PRODUCTION && isSocialLogin && (
        <Button onClick={resetAccount} variant="danger" size="small" fullWidth disableElevation>
          Delete account
        </Button>
      )}
    </Box>
  )
}

export default madProps(WalletInfo, {
  socialWalletService: useSocialWallet,
  router: useRouter,
  onboard: useOnboard,
  addressBook: useAddressBook,
})
