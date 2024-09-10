import type { DecodedDataResponse } from '@safe-global/safe-gateway-typescript-sdk'

export const isChangingSignerSetupp = (decodedData: DecodedDataResponse | undefined) => {
  return decodedData?.method === 'addOwnerWithThreshold' || decodedData?.method === 'removeOwner'
}
