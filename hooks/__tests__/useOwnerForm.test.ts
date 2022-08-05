import { useOwnerForm } from '../useOwnerForm'
import * as addressBook from '@/hooks/useAddressBook'
import { ethers } from 'ethers'
import * as domains from '@/services/domains'
import * as useMnemonicSafeName from '@/hooks/useMnemonicName/index'
import * as web3 from '@/hooks/wallets/web3'
import * as useChains from '@/hooks/useChains'
import { renderHook, waitFor } from '@/tests/test-utils'
import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'

const ADDRESS1 = ethers.utils.hexZeroPad('0x1', 20)
const ADDRESS2 = ethers.utils.hexZeroPad('0x2', 20)
const ADDRESS3 = ethers.utils.hexZeroPad('0x3', 20)

const FALLBACK_NAME = 'FALLBACK'

describe('useOwnerForm', () => {
  beforeAll(() => {
    jest.spyOn(useMnemonicSafeName, 'useMnemonicSafeName').mockImplementation(() => FALLBACK_NAME)
    // We mock the lookup call so we don't need a functional web3 mock
    jest.spyOn(web3, 'useWeb3ReadOnly').mockImplementation(() => ({} as any))
  })
  it('does nothing for undefined owner fields', () => {
    const updateMock = jest.fn()

    jest.spyOn(addressBook, 'default').mockReturnValue({})
    const domainsMock = jest.spyOn(domains, 'lookupAddress').mockImplementation(() => {
      return Promise.resolve(undefined)
    })

    renderHook(() => useOwnerForm(undefined, updateMock))

    expect(updateMock).not.toHaveBeenCalled()
    expect(domainsMock).not.toHaveBeenCalled()
  })

  it('does not resolves name if name is already set', () => {
    const updateMock = jest.fn()

    jest.spyOn(addressBook, 'default')
    const domainsMock = jest.spyOn(domains, 'lookupAddress').mockImplementation(() => {
      return Promise.resolve(undefined)
    })

    renderHook(() =>
      useOwnerForm(
        [
          {
            address: ADDRESS1,
            name: 'Some name',
            resolving: false,
          },
        ],
        updateMock,
      ),
    )

    expect(updateMock).not.toHaveBeenCalled()

    expect(domainsMock).not.toHaveBeenCalled()
  })

  it('resolves name from addressbook if name is empty', () => {
    const updateMock = jest.fn()

    jest.spyOn(addressBook, 'default').mockReturnValue({
      [ADDRESS1]: 'Testname',
    })
    const domainsMock = jest.spyOn(domains, 'lookupAddress').mockImplementation(() => {
      return Promise.resolve(undefined)
    })

    jest.spyOn(useChains, 'useCurrentChain').mockImplementation(
      () =>
        ({
          features: [FEATURES.DOMAIN_LOOKUP],
          chainId: '1',
        } as any),
    )

    renderHook(() =>
      useOwnerForm(
        [
          {
            address: ADDRESS1,
            name: '',
            resolving: false,
          },
        ],
        updateMock,
      ),
    )

    expect(updateMock).toHaveBeenCalledTimes(3)
    expect(updateMock).toHaveBeenNthCalledWith(1, '0.resolving', true)
    expect(updateMock).toHaveBeenNthCalledWith(2, '0.name', 'Testname')
    expect(updateMock).toHaveBeenNthCalledWith(3, '0.resolving', false)

    expect(domainsMock).not.toHaveBeenCalled()
  })

  it('resolves name from addressbook if name is fallback', () => {
    const updateMock = jest.fn()

    jest.spyOn(addressBook, 'default').mockReturnValue({
      [ADDRESS1]: 'Testname',
    })

    jest.spyOn(useChains, 'useCurrentChain').mockImplementation(
      () =>
        ({
          features: [FEATURES.DOMAIN_LOOKUP],
          chainId: '1',
        } as any),
    )

    const domainsMock = jest.spyOn(domains, 'lookupAddress').mockImplementation(() => {
      return Promise.resolve(undefined)
    })

    renderHook(() =>
      useOwnerForm(
        [
          {
            address: ADDRESS1,
            name: FALLBACK_NAME,
            resolving: false,
          },
        ],
        updateMock,
      ),
    )

    expect(updateMock).toHaveBeenCalledTimes(4)
    expect(updateMock).toHaveBeenNthCalledWith(1, '0.resolving', true)
    expect(updateMock).toHaveBeenNthCalledWith(2, '0.name', FALLBACK_NAME)
    expect(updateMock).toHaveBeenNthCalledWith(3, '0.name', 'Testname')
    expect(updateMock).toHaveBeenNthCalledWith(4, '0.resolving', false)

    expect(domainsMock).not.toHaveBeenCalled()
  })

  it('resolves to fallback name if prop is passed and nothing else finds a name', async () => {
    const updateMock = jest.fn()
    jest.spyOn(useChains, 'useCurrentChain').mockImplementation(
      () =>
        ({
          features: [FEATURES.DOMAIN_LOOKUP],
          chainId: '1',
        } as any),
    )
    jest.spyOn(addressBook, 'default').mockReturnValue({})
    const domainsMock = jest.spyOn(domains, 'lookupAddress').mockImplementation(() => {
      return Promise.resolve(undefined)
    })

    renderHook(() =>
      useOwnerForm(
        [
          {
            address: ADDRESS1,
            name: '',
            resolving: false,
          },
        ],
        updateMock,
      ),
    )

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledTimes(3)
      expect(updateMock).toHaveBeenNthCalledWith(1, '0.resolving', true)
      expect(updateMock).toHaveBeenNthCalledWith(2, '0.name', FALLBACK_NAME)
      expect(updateMock).toHaveBeenNthCalledWith(3, '0.resolving', false)

      expect(domainsMock).toHaveBeenCalled()
    })
  })

  it('resolves to ens name if no addressbook name is found', async () => {
    const updateMock = jest.fn()

    jest.spyOn(addressBook, 'default').mockReturnValue({})
    const domainsMock = jest.spyOn(domains, 'lookupAddress').mockImplementation(() => {
      return Promise.resolve('test.eth')
    })
    jest.spyOn(useChains, 'useCurrentChain').mockImplementation(
      () =>
        ({
          features: [FEATURES.DOMAIN_LOOKUP],
          chainId: '1',
        } as any),
    )

    renderHook(() =>
      useOwnerForm(
        [
          {
            address: ADDRESS1,
            name: '',
            resolving: false,
          },
        ],
        updateMock,
      ),
    )

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledTimes(4)
      expect(updateMock).toHaveBeenNthCalledWith(1, '0.resolving', true)
      expect(updateMock).toHaveBeenNthCalledWith(2, '0.name', FALLBACK_NAME)
      expect(updateMock).toHaveBeenNthCalledWith(3, '0.name', 'test.eth')
      expect(updateMock).toHaveBeenNthCalledWith(4, '0.resolving', false)

      expect(domainsMock).toHaveBeenCalled()
    })
  })

  it('does not resolve ens name if feature is disabled', async () => {
    const updateMock = jest.fn()

    jest.spyOn(addressBook, 'default').mockReturnValue({})
    const domainsMock = jest.spyOn(domains, 'lookupAddress').mockImplementation(() => {
      return Promise.resolve('test.eth')
    })
    jest.spyOn(useChains, 'useCurrentChain').mockImplementation(
      () =>
        ({
          features: [],
          chainId: '1',
        } as any),
    )

    renderHook(() =>
      useOwnerForm(
        [
          {
            address: ADDRESS1,
            name: '',
            resolving: false,
          },
        ],
        updateMock,
      ),
    )

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledTimes(2)
      expect(updateMock).toHaveBeenNthCalledWith(1, '0.resolving', true)
      expect(updateMock).toHaveBeenNthCalledWith(2, '0.resolving', false)

      expect(domainsMock).toHaveBeenCalled()
    })
  })
})
