import { Skeleton } from '@mui/material'
import metamaskIcon from '@web3-onboard/injected-wallets/dist/icons/metamask'
import coinbaseIcon from '@web3-onboard/coinbase/dist/icon'
import keystoneIcon from '@web3-onboard/keystone/dist/icon'
import walletConnectIcon from '@web3-onboard/walletconnect/dist/icon'
import trezorIcon from '@web3-onboard/trezor/dist/icon'
import ledgerIcon from '@web3-onboard/ledger/dist/icon'
import fortmaticIcon from '@web3-onboard/fortmatic/dist/icon'
import portisIcon from '@web3-onboard/portis/dist/icon'
import torusIcon from '@web3-onboard/torus/dist/icon'
import { WALLET_KEYS } from '@/hooks/wallets/wallets'

enum ADDITIONAL_KEYS {
  METAMASK = 'METAMASK',
}

export type ALL_WALLET_KEYS = typeof WALLET_KEYS & typeof ADDITIONAL_KEYS

type Props = {
  [k in keyof ALL_WALLET_KEYS]: string
}

const WALLET_ICONS: Props = {
  [ADDITIONAL_KEYS.METAMASK]: metamaskIcon,
  [WALLET_KEYS.COINBASE]: coinbaseIcon,
  [WALLET_KEYS.INJECTED]: metamaskIcon,
  [WALLET_KEYS.KEYSTONE]: keystoneIcon,
  [WALLET_KEYS.WALLETCONNECT]: walletConnectIcon,
  [WALLET_KEYS.TREZOR]: trezorIcon,
  [WALLET_KEYS.LEDGER]: ledgerIcon,
  [WALLET_KEYS.FORTMATIC]: fortmaticIcon,
  [WALLET_KEYS.PORTIS]: portisIcon,
  [WALLET_KEYS.TORUS]: torusIcon,
}

const WalletIcon = ({ provider }: { provider: string }) => {
  const icon = WALLET_ICONS[provider.toUpperCase() as keyof ALL_WALLET_KEYS]

  return icon ? (
    <img width={30} height={30} src={`data:image/svg+xml;utf8,${encodeURIComponent(icon)}`} alt={`${provider} logo`} />
  ) : (
    <Skeleton variant="circular" width={30} height={30} />
  )
}

export default WalletIcon
