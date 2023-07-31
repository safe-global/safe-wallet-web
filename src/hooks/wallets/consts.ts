export const enum WALLET_KEYS {
  COINBASE = 'COINBASE',
  INJECTED = 'INJECTED',
  KEYSTONE = 'KEYSTONE',
  LEDGER = 'LEDGER',
  PAIRING = 'PAIRING',
  TREZOR = 'TREZOR',
  WALLETCONNECT = 'WALLETCONNECT',
  WALLETCONNECT_V2 = 'WALLETCONNECT_V2',
  TAHO = 'TAHO',
}

export const CGW_NAMES: { [key in WALLET_KEYS]: string | undefined } = {
  [WALLET_KEYS.COINBASE]: 'coinbase',
  [WALLET_KEYS.INJECTED]: 'detectedwallet',
  [WALLET_KEYS.KEYSTONE]: 'keystone',
  [WALLET_KEYS.LEDGER]: 'ledger',
  [WALLET_KEYS.PAIRING]: 'safeMobile',
  [WALLET_KEYS.TREZOR]: 'trezor',
  [WALLET_KEYS.WALLETCONNECT]: 'walletConnect',
  [WALLET_KEYS.WALLETCONNECT_V2]: 'walletConnect_v2',
  [WALLET_KEYS.TAHO]: 'tally',
}
