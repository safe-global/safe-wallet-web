import Web3 from 'web3'

export const validateAddress = (value: string): string | undefined => {
  const ADDRESS_RE = /^0x[0-9a-zA-Z]{40}$/

  if (!ADDRESS_RE.test(value)) {
    return 'Invalid address format'
  }

  if (!Web3.utils.checkAddressChecksum(value)) {
    return 'Invalid address checksum'
  }
}
