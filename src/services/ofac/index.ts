import { sameAddress } from '@/utils/addresses'
import blockedAddresses from './blockedAddressList.json'

export const isBlockedAddress = (address: string) => {
  return blockedAddresses.some((blockedAddress) => sameAddress(blockedAddress, address))
}
