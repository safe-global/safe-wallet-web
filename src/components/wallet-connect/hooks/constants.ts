export const SAFE_COMPATIBLE_METHODS = [
  'eth_accounts',
  'net_version',
  'eth_chainId',
  'personal_sign',
  'eth_sign',
  'eth_signTypedData',
  'eth_signTypedData_v4',
  'eth_sendTransaction',
  'eth_blockNumber',
  'eth_getBalance',
  'eth_getCode',
  'eth_getTransactionCount',
  'eth_getStorageAt',
  'eth_getBlockByNumber',
  'eth_getBlockByHash',
  'eth_getTransactionByHash',
  'eth_getTransactionReceipt',
  'eth_estimateGas',
  'eth_call',
  'eth_getLogs',
  'eth_gasPrice',
  'wallet_getPermissions',
  'wallet_requestPermissions',
  'safe_setSettings',
]

export enum WC_ERRORS {
  UNSUPPORTED_CHAIN_ERROR_CODE = 5100,
  INVALID_METHOD_ERROR_CODE = 1001,
  USER_REJECTED_REQUEST_CODE = 4001,
  USER_DISCONNECTED_CODE = 6000,
}

export const SAFE_WALLET_METADATA = {
  name: 'Safe Wallet',
  description: 'The most trusted platform to manage digital assets on Ethereum',
  url: 'https://app.safe.global',
  icons: ['https://app.safe.global/favicons/mstile-150x150.png', 'https://app.safe.global/favicons/logo_120x120.png'],
}

export const EVMBasedNamespaces = 'eip155'
