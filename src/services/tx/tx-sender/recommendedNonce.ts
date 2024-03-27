import { getNonces as fetchNonces } from '@safe-global/safe-gateway-typescript-sdk'
import { Errors, logError } from '@/services/exceptions'

export const getNonces = async (chainId: string, safeAddress: string) => {
  try {
    return await fetchNonces(chainId, safeAddress)
  } catch (e) {
    logError(Errors._616, e)
  }
}
