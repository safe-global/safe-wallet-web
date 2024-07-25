import WalletBalance from '@/components/common/WalletBalance'
import { WalletIdenticon } from '@/components/common/WalletOverview'
import { useWeb3 } from '@/hooks/wallets/web3'
import signInWithEthereum from '@/services/siwe'
import { Box, Button, Typography } from '@mui/material'
import {
  getAccount,
  setBaseUrl,
  createAccount,
  deleteAccount,
  getAccountDataTypes,
  getAccountDataSettings,
  putAccountDataSettings,
} from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'
import ChainSwitcher from '@/components/common/ChainSwitcher'
import useOnboard, { type ConnectedWallet, switchWallet } from '@/hooks/wallets/useOnboard'
import useAddressBook from '@/hooks/useAddressBook'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import madProps from '@/utils/mad-props'
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'
import useChainId from '@/hooks/useChainId'

const SignInButton = ({ wallet }: { wallet: ConnectedWallet }) => {
  setBaseUrl('https://safe-client.staging.5afe.dev')

  const provider = useWeb3()

  if (!provider) return null

  const createUserAccount = async () => {
    await signInWithEthereum(provider)

    return createAccount({ address: wallet.address as any })
  }

  const getUserAccount = async () => {
    await signInWithEthereum(provider)

    return getAccount(wallet.address)
  }

  const deleteUserAccount = async () => {
    await signInWithEthereum(provider)

    return deleteAccount(wallet.address)
  }

  const getDataTypes = async () => {
    return getAccountDataTypes()
  }

  const getUserDataSettings = async () => {
    await signInWithEthereum(provider)

    return getAccountDataSettings(wallet.address)
  }

  const updateUserDataSetting = async () => {
    await signInWithEthereum(provider)

    return putAccountDataSettings(wallet.address, { accountDataSettings: [{ dataTypeId: '1', enabled: true }] })
  }

  return (
    <>
      <button onClick={createUserAccount}>Create account</button>
      <button onClick={getUserAccount}>Get account</button>
      <button onClick={deleteUserAccount}>Delete account</button>
      <button onClick={getDataTypes}>Get data types</button>
      <button onClick={getUserDataSettings}>Get user settings</button>
      <button onClick={updateUserDataSetting}>Update user settings</button>
    </>
  )
}

type WalletInfoProps = {
  wallet: ConnectedWallet
  balance?: string | bigint
  currentChainId: ReturnType<typeof useChainId>
  onboard: ReturnType<typeof useOnboard>
  addressBook: ReturnType<typeof useAddressBook>
  handleClose: () => void
}

export const WalletInfo = ({ wallet, balance, currentChainId, onboard, addressBook, handleClose }: WalletInfoProps) => {
  const chainInfo = useAppSelector((state) => selectChainById(state, wallet.chainId))
  const prefix = chainInfo?.shortName

  const handleSwitchWallet = () => {
    if (onboard) {
      handleClose()
      switchWallet(onboard)
    }
  }

  const handleDisconnect = () => {
    onboard?.disconnectWallet({
      label: wallet.label,
    })

    handleClose()
  }

  return (
    <>
      <Box display="flex" gap="12px">
        <WalletIdenticon wallet={wallet} size={36} />

        <Typography variant="body2" className={css.address} component="div">
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
      </Box>

      <Box className={css.rowContainer}>
        <Box className={css.row}>
          <Typography variant="body2" color="primary.light">
            Wallet
          </Typography>
          <Typography variant="body2">{wallet.label}</Typography>
        </Box>

        <Box className={css.row}>
          <Typography variant="body2" color="primary.light">
            Balance
          </Typography>
          <Typography variant="body2" textAlign="right">
            <WalletBalance balance={balance} />

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

      <Box display="flex" flexDirection="column" gap={2} width={1}>
        <ChainSwitcher fullWidth />

        <Button variant="contained" size="small" onClick={handleSwitchWallet} fullWidth>
          Switch wallet
        </Button>

        <Button
          onClick={handleDisconnect}
          variant="danger"
          size="small"
          fullWidth
          disableElevation
          startIcon={<PowerSettingsNewIcon />}
        >
          Disconnect
        </Button>
        <SignInButton wallet={wallet} />
      </Box>
    </>
  )
}

export default madProps(WalletInfo, {
  onboard: useOnboard,
  addressBook: useAddressBook,
  currentChainId: useChainId,
})
