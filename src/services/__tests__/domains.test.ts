import { type JsonRpcProvider } from '@ethersproject/providers'
import { resolveName, lookupAddress } from '../domains'
import { logError } from '../exceptions'

// mock rpcProvider
const rpcProvider = {
  resolveName: jest.fn(() => Promise.resolve('0x0000000000000000000000000000000000000000')),
  lookupAddress: jest.fn(() => Promise.resolve('safe.eth')),
} as unknown as JsonRpcProvider

const badRpcProvider = {
  resolveName: jest.fn(() => Promise.reject(new Error('bad resolveName'))),
  lookupAddress: jest.fn(() => Promise.reject(new Error('bad lookupAddress'))),
} as unknown as JsonRpcProvider

// mock logError
jest.mock('../exceptions', () => ({
  logError: jest.fn(),
}))

describe('domains', () => {
  it('should resolve names', async () => {
    expect(await resolveName(rpcProvider, '0x123')).toBe(undefined)
    expect(await resolveName(rpcProvider, 'test.')).toBe(undefined)
    expect(await resolveName(rpcProvider, 'test.com')).toBe('0x0000000000000000000000000000000000000000')
    expect(await resolveName(rpcProvider, 'test.eth')).toBe('0x0000000000000000000000000000000000000000')
  })

  it('look up addresses', async () => {
    expect(await lookupAddress(rpcProvider, '0x0000000000000000000000000000000000000000')).toBe('safe.eth')
  })

  it('should log an error if lookup fails', async () => {
    const name = await lookupAddress(badRpcProvider, '0x0000000000000000000000000000000000000000')
    expect(name).toBe(undefined)
    expect(logError).toHaveBeenCalledWith('101: Failed to resolve the address', 'bad lookupAddress')

    const address = await resolveName(badRpcProvider, 'safe.eth')
    expect(address).toBe(undefined)
    expect(logError).toHaveBeenCalledWith('101: Failed to resolve the address', 'bad resolveName')
  })
})
