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
  'safe_setSettings',
]

export const SAFE_WALLET_METADATA = {
  name: 'Safe{Wallet}',
  description: 'The most trusted platform to manage digital assets on Ethereum',
  url: 'https://app.safe.global',
  icons: ['https://app.safe.global/favicons/mstile-150x150.png', 'https://app.safe.global/favicons/logo_120x120.png'],
}

export const EIP155 = 'eip155' as const

// Bridges enforcing same address on destination chains
export const BlockedBridges = [
  'bridge.arbitrum.io',
  'bridge.base.org',
  'cbridge.celer.network',
  'www.orbiter.finance',
  'zksync-era.l2scan.co',
  'app.optimism.io',
  'www.portalbridge.com',
  'wallet.polygon.technology',
  'app.rhino.fi',
]

// Bridges that initially select the same address on the destination chain but allow changing it
export const WarnedBridges = [
  'across.to', // doesn't send their URL correctly, so it won't be detected
  'app.allbridge.io',
  'core.allbridge.io',
  'bungee.exchange',
  'www.carrier.so',
  'app.chainport.io',
  'bridge.gnosischain.com',
  'app.hop.exchange',
  'app.interport.fi',
  'jumper.exchange',
  'www.layerswap.io',
  'meson.fi',
  'satellite.money',
  'stargate.finance',
  'app.squidrouter.com',
  'app.symbiosis.finance',
  'www.synapseprotocol.com',
  'app.thevoyager.io',
  'portal.txsync.io',
  'bridge.wanchain.org',
  'app.xy.finance',
]
