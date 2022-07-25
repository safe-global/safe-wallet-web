// Icons
import metamaskIcon from './icon-metamask.png'
import walletConnectIcon from './icon-wallet-connect.svg'
import trezorIcon from './icon-trezor.svg'
import ledgerIcon from './icon-ledger.svg'
import fortmaticIcon from './icon-fortmatic.svg'
import portisIcon from './icon-portis.svg'
import torusIcon from './icon-torus.svg'
import coinbaseIcon from './icon-coinbase.svg'
import keystoneIcon from './icon-keystone.png'

import { WALLET_KEYS } from '@/hooks/wallets/wallets'
import { StaticImageData } from 'next/image'

enum ADDITIONAL_KEYS {
  METAMASK = 'METAMASK',
}

export type ALL_WALLET_KEYS = typeof WALLET_KEYS & typeof ADDITIONAL_KEYS

type Props = {
  [k in keyof ALL_WALLET_KEYS]: StaticImageData
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

export default WALLET_ICONS
