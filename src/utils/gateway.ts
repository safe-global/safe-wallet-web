import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

export const _replaceTemplate = (uri: string, data: Record<string, string>): string => {
  // Template syntax returned from gateway is {{this}}
  const TEMPLATE_REGEX = /\{\{([^}]+)\}\}/g

  return uri.replace(TEMPLATE_REGEX, (_, key: string) => data[key])
}

export const getHashedExplorerUrl = (
  hash: string,
  blockExplorerUriTemplate: ChainInfo['blockExplorerUriTemplate'],
): string => {
  const isTx = hash.length > 42
  const param = isTx ? 'txHash' : 'address'

  return _replaceTemplate(blockExplorerUriTemplate[param], { [param]: hash })
}

export const getExplorerLink = (
  hash: string,
  blockExplorerUriTemplate: ChainInfo['blockExplorerUriTemplate'],
): { href: string; title: string } => {
  const href = getHashedExplorerUrl(hash, blockExplorerUriTemplate)
  const title = `View on ${new URL(href).hostname}`

  return { href, title }
}

export const isWalletConnectSafeApp = (url: string): boolean => {
  const WALLET_CONNECT = /wallet-connect/
  return WALLET_CONNECT.test(url)
}
