import { EIP155 } from './constants'

export type Eip155ChainId = `${typeof EIP155}:${string}`

export const getEip155ChainId = (chainId: string): Eip155ChainId => {
  return `${EIP155}:${chainId}`
}
