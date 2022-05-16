import { isAddress } from '@ethersproject/address'

export const validateAddress = (value: string): string | undefined => {
  const ADDRESS_RE = /^0x[0-9a-zA-Z]{40}$/

  if (!ADDRESS_RE.test(value)) {
    return 'Invalid address format'
  }

  if (!isAddress(value)) {
    return 'Invalid address checksum'
  }
}
