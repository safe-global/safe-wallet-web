import { renderHook } from '@/tests/test-utils'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import * as web3 from '@/hooks/wallets/web3'
import { Web3Provider } from '@ethersproject/providers'
import Safe from '@gnosis.pm/safe-core-sdk'
import { PendingSafeData } from '@/components/create-safe'
import useResolvePromise from '@/components/create-safe/status/hooks/useResolvePromise'
import * as ABSlice from '@/store/addressBookSlice'
import * as addedSafes from '@/store/addedSafesSlice'
import { waitFor } from '@testing-library/react'
import { defaultSafeInfo } from '@/store/safeInfoSlice'

describe('useResolvePromise', () => {
  beforeEach(() => {
    jest.restoreAllMocks()

    const mockProvider: Web3Provider = new Web3Provider(jest.fn())
    jest.spyOn(web3, 'useWeb3').mockImplementation(() => mockProvider)
  })

  it('should do nothing if there is no promise', () => {
    const setStatusSpy = jest.fn()

    renderHook(() =>
      useResolvePromise({
        creationPromise: undefined,
        setStatus: setStatusSpy,
        pendingSafe: {} as PendingSafeData,
      }),
    )

    expect(setStatusSpy).not.toHaveBeenCalled()
  })

  it('should do nothing if there is no pending safe data', () => {
    const mockPromise = new Promise(() => {}) as Promise<Safe>
    const setStatusSpy = jest.fn()

    renderHook(() =>
      useResolvePromise({
        creationPromise: mockPromise,
        setStatus: setStatusSpy,
        pendingSafe: undefined,
      }),
    )

    expect(setStatusSpy).not.toHaveBeenCalled()
  })

  it('sets SUCCESS status if promise resolves', async () => {
    const mockPromise = Promise.resolve({ getAddress: () => '0x10' } as Safe)
    const setStatusSpy = jest.fn()

    renderHook(() =>
      useResolvePromise({
        creationPromise: mockPromise,
        setStatus: setStatusSpy,
        pendingSafe: {} as PendingSafeData,
      }),
    )

    await waitFor(() => {
      expect(setStatusSpy).toHaveBeenCalledWith(SafeCreationStatus.SUCCESS)
    })
  })

  it('sets ERROR status if promise rejects', async () => {
    const mockPromise = Promise.reject({ message: 'Something went wrong' })
    const setStatusSpy = jest.fn()

    renderHook(() =>
      useResolvePromise({
        creationPromise: mockPromise,
        setStatus: setStatusSpy,
        pendingSafe: {} as PendingSafeData,
      }),
    )

    await waitFor(() => {
      expect(setStatusSpy).toHaveBeenCalledWith(SafeCreationStatus.ERROR)
    })
  })

  it('adds safe and owners to address book if promise resolves', async () => {
    const addToABSpy = jest.spyOn(ABSlice, 'upsertAddressBookEntry')
    const mockPromise = Promise.resolve({ getAddress: () => '0x10' } as Safe)
    const setStatusSpy = jest.fn()

    renderHook(() =>
      useResolvePromise({
        creationPromise: mockPromise,
        setStatus: setStatusSpy,
        pendingSafe: {
          name: 'mockName',
          chainId: '4',
          owners: [{ name: 'mockOwner', address: '0x11' }],
        } as PendingSafeData,
      }),
    )

    await waitFor(() => {
      expect(addToABSpy).toHaveBeenNthCalledWith(1, { address: '0x10', chainId: '4', name: 'mockName' })
      expect(addToABSpy).toHaveBeenNthCalledWith(2, { address: '0x11', chainId: '4', name: 'mockOwner' })
    })
  })

  it('adds safe to the added safe list', async () => {
    const addSafeSpy = jest.spyOn(addedSafes, 'addOrUpdateSafe')
    const mockPromise = Promise.resolve({ getAddress: () => '0x10' } as Safe)
    const setStatusSpy = jest.fn()

    const mockPendingSafe = {
      name: 'mockName',
      chainId: '4',
      threshold: 1,
      owners: [{ name: 'mockOwner', address: '0x11' }],
    } as PendingSafeData

    renderHook(() =>
      useResolvePromise({
        creationPromise: mockPromise,
        setStatus: setStatusSpy,
        pendingSafe: mockPendingSafe,
      }),
    )

    await waitFor(() => {
      expect(addSafeSpy).toHaveBeenCalledWith({
        safe: {
          ...defaultSafeInfo,
          address: { value: '0x10', name: mockPendingSafe.name },
          threshold: 1,
          owners: [
            {
              value: mockPendingSafe.owners[0].address,
              name: mockPendingSafe.owners[0].name,
            },
          ],
          chainId: mockPendingSafe.chainId,
          nonce: 0,
        },
      })
    })
  })
})
