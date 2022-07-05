import { type Web3Provider } from '@ethersproject/providers'
import { logError } from './exceptions'
import ErrorCodes from './exceptions/ErrorCodes'

type EthersError = Error & {
  reason?: string
}

export const resolveDomain = async (ethersProvider: Web3Provider, name: string): Promise<string | undefined> => {
  // Check if the value looks like a domain name
  if (!/^[^.]+[.][^.]{2,}$/iu.test(name)) return

  try {
    return (await ethersProvider.resolveName(name)) || undefined
  } catch (e) {
    const err = e as EthersError
    logError(ErrorCodes._101, err.reason || err.message)
  }
}

export const lookupAddress = async (ethersProvider: Web3Provider, address: string): Promise<string | undefined> => {
  try {
    return (await ethersProvider.lookupAddress(address)) || undefined
  } catch (e) {
    const err = e as EthersError
    logError(ErrorCodes._101, err.reason || err.message)
  }
}
