import chains from '@/config/chains'
import { isAddress } from '@ethersproject/address'
import { type TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { parsePrefixedAddress, sameAddress } from './addresses'
import { formatDecimals, toWei } from './formatters'

export const validateAddress = (address: string) => {
  const ADDRESS_RE = /^0x[0-9a-zA-Z]{40}$/

  if (!ADDRESS_RE.test(address)) {
    return 'Invalid address format'
  }

  if (!isAddress(address)) {
    return 'Invalid address checksum'
  }
}

const chainIds = Object.values(chains)
export const validateChainId = (chainId: string) => {
  if (!chainIds.includes(chainId)) {
    return 'Invalid chain ID'
  }
}

export const validatePrefixedAddress =
  (chainShortName?: string) =>
  (value: string): string | undefined => {
    const { prefix, address } = parsePrefixedAddress(value)

    if (prefix) {
      if (!chains[prefix]) {
        return `Invalid chain prefix "${prefix}"`
      }
      if (prefix !== chainShortName) {
        return `"${prefix}" doesn't match the current chain`
      }
    }

    return validateAddress(address)
  }

export const uniqueAddress =
  (addresses: string[] = []) =>
  (address: string): string | undefined => {
    const ADDRESS_REPEATED_ERROR = 'Address already added'
    const addressExists = addresses.some((addressFromList) => sameAddress(addressFromList, address))
    return addressExists ? ADDRESS_REPEATED_ERROR : undefined
  }

export const addressIsNotCurrentSafe =
  (safeAddress: string) =>
  (address: string): string | undefined => {
    const OWNER_ADDRESS_IS_SAFE_ADDRESS_ERROR = 'Cannot use Safe itself as owner.'
    return sameAddress(safeAddress, address) ? OWNER_ADDRESS_IS_SAFE_ADDRESS_ERROR : undefined
  }

export const FLOAT_REGEX = /^[0-9]+([,.][0-9]+)?$/

export const validateNumber = (amount: string) => {
  if (isNaN(Number(amount))) {
    return 'The amount must be a number'
  }

  if (parseFloat(amount) <= 0) {
    return 'The amount must be greater than 0'
  }
}

export const validateTokenAmount = (amount: string, token?: { balance: string; tokenInfo: TokenInfo }) => {
  if (!token) return

  const numberError = validateNumber(amount)
  if (numberError) {
    return numberError
  }

  if (toWei(amount, token.tokenInfo.decimals).gt(token.balance)) {
    return `Maximum value is ${formatDecimals(token.balance, token.tokenInfo.decimals)}`
  }
}

export const validateAmount = (amount: string, decimals?: number, max?: string) => {
  if (!decimals || !max) return

  const numberError = validateNumber(amount)
  if (numberError) {
    return numberError
  }

  if (toWei(amount, decimals).gt(max)) {
    return `Maximum value is ${formatDecimals(max, decimals)}`
  }
}

export const isValidURL = (url: string, protocolsAllowed = ['https:']): boolean => {
  try {
    const urlInfo = new URL(url)

    return protocolsAllowed.includes(urlInfo.protocol)
  } catch (error) {
    return false
  }
}
