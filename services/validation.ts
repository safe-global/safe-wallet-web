import Web3 from 'web3'
import { sameAddress } from './addresses'

export const validateAddress = (value: string): string | undefined => {
  const ADDRESS_RE = /^0x[0-9a-zA-Z]{40}$/

  if (!ADDRESS_RE.test(value)) {
    return 'Invalid address format'
  }

  if (!Web3.utils.checkAddressChecksum(value)) {
    return 'Invalid address checksum'
  }
}

export const ADDRESS_REPEATED_ERROR = 'Address already added'

export const uniqueAddress =
  (addresses: string[] = []) =>
  (address?: string): string | undefined => {
    const addressExists = addresses.some((addressFromList) => sameAddress(addressFromList, address))
    return addressExists ? ADDRESS_REPEATED_ERROR : undefined
  }

export const OWNER_ADDRESS_IS_SAFE_ADDRESS_ERROR = 'Cannot use Safe itself as owner.'

export const addressIsNotCurrentSafe =
  (safeAddress: string) =>
  (address?: string): string | undefined =>
    sameAddress(safeAddress, address) ? OWNER_ADDRESS_IS_SAFE_ADDRESS_ERROR : undefined
