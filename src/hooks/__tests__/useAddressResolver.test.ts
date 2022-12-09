import { useAddressResolver } from '@/hooks/useAddressResolver'
import * as addressBook from '@/hooks/useAddressBook'
import { ethers } from 'ethers'
import * as domains from '@/services/ens'
import * as web3 from '@/hooks/wallets/web3'
import * as useChains from '@/hooks/useChains'
import { renderHook, waitFor } from '@/tests/test-utils'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { FEATURES } from '@safe-global/safe-gateway-typescript-sdk'
import { JsonRpcProvider } from '@ethersproject/providers'

const ADDRESS1 = ethers.utils.hexZeroPad('0x1', 20)
const mockProvider = new JsonRpcProvider()

describe('useAddressResolver', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(web3, 'useWeb3ReadOnly').mockImplementation(() => mockProvider)
  })

  it('returns address book name if found, not resolving ENS domain', async () => {
    jest.spyOn(addressBook, 'default').mockReturnValue({
      [ADDRESS1]: 'Testname',
    })
    const domainsMock = jest.spyOn(domains, 'lookupAddress').mockImplementation(() => {
      return Promise.resolve('test.eth')
    })

    const { result } = renderHook(() => useAddressResolver(ADDRESS1))

    await waitFor(() => {
      expect(result.current.ens).toBeUndefined()
      expect(result.current.name).toBe('Testname')
      expect(result.current.resolving).toBe(false)
      expect(domainsMock).toHaveBeenCalledTimes(0)
    })
  })

  it('resolves ENS domain if no address book name is found', async () => {
    jest.spyOn(addressBook, 'default').mockReturnValue({})
    const domainsMock = jest.spyOn(domains, 'lookupAddress').mockImplementation(() => {
      return Promise.resolve('test.eth')
    })
    jest.spyOn(useChains, 'useCurrentChain').mockReturnValue({
      features: [FEATURES.DOMAIN_LOOKUP],
      chainId: '1',
    } as ChainInfo)

    const { result } = renderHook(() => useAddressResolver(ADDRESS1))

    await waitFor(() => {
      expect(result.current.ens).toBe('test.eth')
      expect(result.current.name).toBeUndefined()
      expect(result.current.resolving).toBe(false)
      expect(domainsMock).toHaveBeenCalledTimes(1)
    })
  })

  it('does not resolve ENS domain if feature is disabled', async () => {
    jest.spyOn(addressBook, 'default').mockReturnValue({})
    const domainsMock = jest.spyOn(domains, 'lookupAddress').mockImplementation(() => {
      return Promise.resolve('test.eth')
    })
    jest.spyOn(useChains, 'useCurrentChain').mockReturnValue({
      features: [FEATURES.EIP1559],
      chainId: '1',
    } as ChainInfo)

    const { result } = renderHook(() => useAddressResolver(ADDRESS1))

    await waitFor(() => {
      expect(result.current.ens).toBeUndefined()
      expect(result.current.name).toBeUndefined()
      expect(result.current.resolving).toBe(false)
      expect(domainsMock).toHaveBeenCalledTimes(0)
    })
  })
})
