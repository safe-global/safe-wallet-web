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
  'wallet_switchEthereumChain',
  'safe_setSettings', // TODO: support it
]

export const SAFE_WALLET_METADATA = {
  name: 'Safe{Wallet}',
  description: 'The most trusted platform to manage digital assets on Ethereum',
  url: 'https://app.safe.global',
  icons: ['https://app.safe.global/favicons/mstile-150x150.png', 'https://app.safe.global/favicons/logo_120x120.png'],
}

export const EIP155 = 'eip155' as const
