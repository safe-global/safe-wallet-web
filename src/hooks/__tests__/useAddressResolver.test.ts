import { useAddressResolver } from '@/hooks/useAddressResolver'
import * as addressBook from '@/hooks/useAddressBook'
import { ethers } from 'ethers'
import * as domains from '@/services/domains'
import * as useMnemonicSafeName from '@/hooks/useMnemonicName/index'
import * as web3 from '@/hooks/wallets/web3'
import * as useChains from '@/hooks/useChains'
import { renderHook, waitFor } from '@/tests/test-utils'
import { ChainInfo, FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { JsonRpcProvider } from '@ethersproject/providers'

const ADDRESS1 = ethers.utils.hexZeroPad('0x1', 20)
const FALLBACK_NAME = 'FALLBACK'
const mockProvider = new JsonRpcProvider()

describe('useAddressResolver', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    jest.spyOn(useMnemonicSafeName, 'useMnemonicSafeName').mockImplementation(() => FALLBACK_NAME)
    jest.spyOn(web3, 'useWeb3ReadOnly').mockImplementation(() => mockProvider)
  })

  it('returns undefined for an empty address', async () => {
    const { result } = renderHook(() => useAddressResolver(''))

    await waitFor(() => {
      expect(result.current.name).toBeUndefined()
      expect(result.current.resolving).toBe(false)
    })
  })

  it('resolves name from address book if found', async () => {
    jest.spyOn(addressBook, 'default').mockReturnValue({
      [ADDRESS1]: 'Testname',
    })
    const { result } = renderHook(() => useAddressResolver(ADDRESS1))

    await waitFor(() => {
      expect(result.current.name).toBe('Testname')
      expect(result.current.resolving).toBe(false)
    })
  })

  it('resolves to ens name if no address book name is found', async () => {
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
      expect(result.current.name).toBe('test.eth')
      expect(result.current.resolving).toBe(false)
      expect(domainsMock).toHaveBeenCalledTimes(1)
    })
  })

  it('does not resolve ens name if feature is disabled', async () => {
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
      expect(result.current.name).toBeUndefined()
      expect(result.current.resolving).toBe(false)
      expect(domainsMock).toHaveBeenCalledTimes(0)
    })
  })
})
