import { Skeleton } from '@mui/material'
import metamaskIcon from '@web3-onboard/injected-wallets/dist/icons/metamask'
import coinbaseIcon from '@web3-onboard/coinbase/dist/icon'
import keystoneIcon from '@web3-onboard/keystone/dist/icon'
import walletConnectIcon from '@web3-onboard/walletconnect/dist/icon'
import trezorIcon from '@web3-onboard/trezor/dist/icon'
import ledgerIcon from '@web3-onboard/ledger/dist/icon'
import tallyhoIcon from '@web3-onboard/tallyho/dist/icon'
import phantomIcon from '@web3-onboard/phantom/dist/icon'

import { WALLET_KEYS } from '@/hooks/wallets/wallets'
import pairingIcon from '@/services/pairing/icon'
import { PAIRING_MODULE_LABEL } from '@/services/pairing/module'
import { E2E_WALLET_NAME } from '@/tests/e2e-wallet'

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
  [WALLET_KEYS.PAIRING]: pairingIcon,
  [WALLET_KEYS.TALLYHO]: tallyhoIcon,
  [WALLET_KEYS.PHANTOM]: phantomIcon,
}

// Labels may differ from ALL_WALLET_KEYS
const WALLET_LABELS: { [label: string]: WALLET_KEYS } = {
  [PAIRING_MODULE_LABEL]: WALLET_KEYS.PAIRING,
}

const getWalletIcon = (provider: string) => {
  if (provider === E2E_WALLET_NAME) {
    return metamaskIcon
  }

  const label = WALLET_LABELS?.[provider] || provider.toUpperCase()

  return WALLET_ICONS[label]
}

const WalletIcon = ({ provider }: { provider: string }) => {
  const icon = getWalletIcon(provider)

  return icon ? (
    <img width={30} height={30} src={`data:image/svg+xml;utf8,${encodeURIComponent(icon)}`} alt={`${provider} logo`} />
  ) : (
    <Skeleton variant="circular" width={30} height={30} />
  )
}

export default WalletIcon
