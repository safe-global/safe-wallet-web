import { BaseTransaction, ChainInfo } from '@gnosis.pm/safe-apps-sdk'
import { formatVisualAmount } from '@/utils/formatters'
import { validateAddress } from '@/utils/validation'
import { isHexString, toUtf8String } from 'ethers/lib/utils'

const validateTransaction = (t: BaseTransaction): boolean => {
  if (!['string', 'number'].includes(typeof t.value)) {
    return false
  }

  if (typeof t.value === 'string' && !/^(0x)?[0-9a-f]+$/i.test(t.value)) {
    return false
  }

  const isAddressValid = validateAddress(t.to) === undefined
  return isAddressValid && !!t.data && typeof t.data === 'string'
}

export const isTxValid = (txs: BaseTransaction[]) => txs.length && txs.every((t) => validateTransaction(t))

export const getInteractionTitle = (value?: string, chain?: ChainInfo) => {
  const { decimals, symbol } = chain!.nativeCurrency
  return `Interact with${
    Number(value) !== 0 ? ` (and send ${formatVisualAmount(value || 0, decimals)} ${symbol} to)` : ''
  }:`
}

export const convertToHumanReadableMessage = (message: string): string => {
  if (!isHexString(message)) {
    return message
  }

  return toUtf8String(message)
}

export const getLegacyChainName = (chainName: string, chainId: string): string => {
  let network = chainName

  switch (chainId) {
    case '1':
      network = 'MAINNET'
      break
    case '100':
      network = 'XDAI'
  }

  return network
}
