import { type JsonRpcProvider } from '@ethersproject/providers'
import { logError } from './exceptions'
import ErrorCodes from './exceptions/ErrorCodes'

type EthersError = Error & {
  reason?: string
}

// ENS domains can have any TLD, so just check that it ends with a dot-separated tld
const DOMAIN_RE = /[^.]+[.][^.]+$/iu

export const resolveName = async (rpcProvider: JsonRpcProvider, name: string): Promise<string | undefined> => {
  // Check if the value looks like a domain name
  if (!DOMAIN_RE.test(name)) return

  try {
    return (await rpcProvider.resolveName(name)) || undefined
  } catch (e) {
    const err = e as EthersError
    logError(ErrorCodes._101, err.reason || err.message)
  }
}

export const lookupAddress = async (rpcProvider: JsonRpcProvider, address: string): Promise<string | undefined> => {
  try {
    return (await rpcProvider.lookupAddress(address)) || undefined
  } catch (e) {
    const err = e as EthersError
    logError(ErrorCodes._101, err.reason || err.message)
  }
}
