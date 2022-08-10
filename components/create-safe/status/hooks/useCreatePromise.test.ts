import { renderHook } from '@/tests/test-utils'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import * as web3 from '@/hooks/wallets/web3'
import { Web3Provider } from '@ethersproject/providers'
import useCreatePromise from '@/components/create-safe/status/hooks/useCreatePromise'
import Safe from '@gnosis.pm/safe-core-sdk'
import { Owner, PendingSafeData } from '@/components/create-safe'

describe('useCreatePromise', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    const mockProvider: Web3Provider = new Web3Provider(jest.fn())
    jest.spyOn(web3, 'useWeb3').mockImplementation(() => mockProvider)
  })

  it('should do nothing if there is already a promise', () => {
    const mockPromise = new Promise(() => {}) as Promise<Safe>
    const setStatusSpy = jest.fn()
    const setCreationPromiseSpy = jest.fn()

    renderHook(() =>
      useCreatePromise({
        status: SafeCreationStatus.AWAITING,
        creationPromise: mockPromise,
        pendingSafe: {} as PendingSafeData,
        safeCreationCallback: jest.fn(),
        setCreationPromise: setCreationPromiseSpy,
        setStatus: setStatusSpy,
      }),
    )

    expect(setStatusSpy).not.toHaveBeenCalled()
    expect(setCreationPromiseSpy).not.toHaveBeenCalled()
  })

  it('should do nothing if there is no pending safe data', () => {
    const setStatusSpy = jest.fn()
    const setCreationPromiseSpy = jest.fn()

    renderHook(() =>
      useCreatePromise({
        status: SafeCreationStatus.AWAITING,
        creationPromise: undefined,
        pendingSafe: undefined,
        safeCreationCallback: jest.fn(),
        setCreationPromise: setCreationPromiseSpy,
        setStatus: setStatusSpy,
      }),
    )

    expect(setStatusSpy).not.toHaveBeenCalled()
    expect(setCreationPromiseSpy).not.toHaveBeenCalled()
  })

  it('should do nothing if there is already a tx hash', () => {
    const setStatusSpy = jest.fn()
    const setCreationPromiseSpy = jest.fn()

    renderHook(() =>
      useCreatePromise({
        status: SafeCreationStatus.AWAITING,
        creationPromise: undefined,
        pendingSafe: { txHash: '0x123' } as PendingSafeData,
        safeCreationCallback: jest.fn(),
        setCreationPromise: setCreationPromiseSpy,
        setStatus: setStatusSpy,
      }),
    )

    expect(setStatusSpy).not.toHaveBeenCalled()
    expect(setCreationPromiseSpy).not.toHaveBeenCalled()
  })

  it('should do nothing if there is an ERROR state', () => {
    const setStatusSpy = jest.fn()
    const setCreationPromiseSpy = jest.fn()

    renderHook(() =>
      useCreatePromise({
        status: SafeCreationStatus.ERROR,
        creationPromise: undefined,
        pendingSafe: {} as PendingSafeData,
        safeCreationCallback: jest.fn(),
        setCreationPromise: setCreationPromiseSpy,
        setStatus: setStatusSpy,
      }),
    )

    expect(setStatusSpy).not.toHaveBeenCalled()
    expect(setCreationPromiseSpy).not.toHaveBeenCalled()
  })

  it('should do nothing if there is an AWAITING_WALLET state', () => {
    const setStatusSpy = jest.fn()
    const setCreationPromiseSpy = jest.fn()

    renderHook(() =>
      useCreatePromise({
        status: SafeCreationStatus.AWAITING_WALLET,
        creationPromise: undefined,
        pendingSafe: {} as PendingSafeData,
        safeCreationCallback: jest.fn(),
        setCreationPromise: setCreationPromiseSpy,
        setStatus: setStatusSpy,
      }),
    )

    expect(setStatusSpy).not.toHaveBeenCalled()
    expect(setCreationPromiseSpy).not.toHaveBeenCalled()
  })

  it('should do nothing if there is no provider', () => {
    jest.spyOn(web3, 'useWeb3').mockImplementation(() => undefined)
    const setStatusSpy = jest.fn()
    const setCreationPromiseSpy = jest.fn()

    renderHook(() =>
      useCreatePromise({
        status: SafeCreationStatus.AWAITING,
        creationPromise: undefined,
        pendingSafe: {} as PendingSafeData,
        safeCreationCallback: jest.fn(),
        setCreationPromise: setCreationPromiseSpy,
        setStatus: setStatusSpy,
      }),
    )

    expect(setStatusSpy).not.toHaveBeenCalled()
    expect(setCreationPromiseSpy).not.toHaveBeenCalled()
  })

  it('should set the status to AWAITING and create a new promise', () => {
    const setStatusSpy = jest.fn()
    const setCreationPromiseSpy = jest.fn()

    const mockPendingSafe = {
      threshold: 1,
      owners: [] as Owner[],
      saltNonce: 123,
    }

    renderHook(() =>
      useCreatePromise({
        status: SafeCreationStatus.AWAITING,
        creationPromise: undefined,
        pendingSafe: mockPendingSafe as PendingSafeData,
        safeCreationCallback: jest.fn(),
        setCreationPromise: setCreationPromiseSpy,
        setStatus: setStatusSpy,
      }),
    )

    expect(setStatusSpy).toHaveBeenCalledWith(SafeCreationStatus.AWAITING)
    expect(setCreationPromiseSpy).toHaveBeenCalled()
  })
})
