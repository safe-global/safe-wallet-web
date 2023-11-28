import { type JsonRpcProvider } from '@ethersproject/providers'
import { logError } from '../exceptions'
import ErrorCodes from '../exceptions/ErrorCodes'
import { CUSTOM_REGISTRIES } from './config'
import { customResolveName } from './custom'

type EthersError = Error & {
  reason?: string
}

// ENS domains can have any TLD, so just check that it ends with a dot-separated tld
const DOMAIN_RE = /[^.]+[.][^.]+$/iu

export function isDomain(domain: string): boolean {
  return DOMAIN_RE.test(domain)
}

export const resolveName = async (rpcProvider: JsonRpcProvider, name: string): Promise<string | undefined> => {
  let chainId = ''
  try {
    chainId = (await rpcProvider.getNetwork()).chainId.toString()
  } catch {}

  try {
    // Try custom resolvers first
    if (chainId && CUSTOM_REGISTRIES[chainId]) {
      return await customResolveName(CUSTOM_REGISTRIES[chainId], rpcProvider, name)
    }

    // The default ENS resolver
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
