import { renderHook } from '@/tests/test-utils'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import * as router from 'next/router'
import { NextRouter } from 'next/router'
import * as web3 from '@/hooks/wallets/web3'
import * as pendingSafe from '@/components/create-safe/status/usePendingSafeCreation'
import * as chainIdModule from '@/hooks/useChainId'
import { Web3Provider } from '@ethersproject/providers'
import { PendingSafeData } from '@/components/create-safe'
import useWatchSafeCreation from '@/components/create-safe/status/hooks/useWatchSafeCreation'
import { AppRoutes } from '@/config/routes'
import { CONFIG_SERVICE_CHAINS } from '@/tests/mocks/chains'

describe('useWatchSafeCreation', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    const mockProvider: Web3Provider = new Web3Provider(jest.fn())
    jest.spyOn(web3, 'useWeb3').mockImplementation(() => mockProvider)
  })

  it('should clear the tx hash if it exists on ERROR or REVERTED', () => {
    // Prevent backOff logging after test is completed
    jest.spyOn(pendingSafe, 'pollSafeInfo').mockImplementation(jest.fn())

    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()

    renderHook(() =>
      useWatchSafeCreation({
        status: SafeCreationStatus.ERROR,
        safeAddress: '0x1',
        pendingSafe: { txHash: '0x10' } as PendingSafeData,
        setPendingSafe: setPendingSafeSpy,
        setStatus: setStatusSpy,
        chainId: '4',
      }),
    )

    expect(setPendingSafeSpy).toHaveBeenCalled()
  })

  it('should not clear the tx hash if it doesnt exist on ERROR or REVERTED', () => {
    // Prevent backOff logging after test is completed
    jest.spyOn(pendingSafe, 'pollSafeInfo').mockImplementation(jest.fn())

    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()

    renderHook(() =>
      useWatchSafeCreation({
        status: SafeCreationStatus.ERROR,
        safeAddress: '0x1',
        pendingSafe: {} as PendingSafeData,
        setPendingSafe: setPendingSafeSpy,
        setStatus: setStatusSpy,
        chainId: '4',
      }),
    )

    expect(setPendingSafeSpy).not.toHaveBeenCalled()
  })

  it('should poll safe info on SUCCESS', () => {
    const pollSafeInfoSpy = jest.spyOn(pendingSafe, 'pollSafeInfo')
    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()

    renderHook(() =>
      useWatchSafeCreation({
        status: SafeCreationStatus.SUCCESS,
        safeAddress: '0x1',
        pendingSafe: {} as PendingSafeData,
        setPendingSafe: setPendingSafeSpy,
        setStatus: setStatusSpy,
        chainId: '4',
      }),
    )

    expect(pollSafeInfoSpy).toHaveBeenCalled()
    expect(setPendingSafeSpy).toHaveBeenCalledWith(undefined)
  })

  it('should not poll safe info on SUCCESS if there is no safe address', () => {
    const pollSafeInfoSpy = jest.spyOn(pendingSafe, 'pollSafeInfo')
    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()

    renderHook(() =>
      useWatchSafeCreation({
        status: SafeCreationStatus.SUCCESS,
        safeAddress: undefined,
        pendingSafe: {} as PendingSafeData,
        setPendingSafe: setPendingSafeSpy,
        setStatus: setStatusSpy,
        chainId: '4',
      }),
    )

    expect(pollSafeInfoSpy).not.toHaveBeenCalled()
    expect(setPendingSafeSpy).toHaveBeenCalledWith(undefined)
  })

  it('should not poll safe info on SUCCESS if there is no pending safe data', () => {
    const pollSafeInfoSpy = jest.spyOn(pendingSafe, 'pollSafeInfo')
    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()

    renderHook(() =>
      useWatchSafeCreation({
        status: SafeCreationStatus.SUCCESS,
        safeAddress: '0x10',
        pendingSafe: undefined,
        setPendingSafe: setPendingSafeSpy,
        setStatus: setStatusSpy,
        chainId: '4',
      }),
    )

    expect(pollSafeInfoSpy).not.toHaveBeenCalled()
    expect(setPendingSafeSpy).toHaveBeenCalledWith(undefined)
  })

  it('should navigate to the dashboard on INDEXED', async () => {
    jest.spyOn(chainIdModule, 'default').mockReturnValue('4')
    const pushMock = jest.fn()
    jest.spyOn(router, 'useRouter').mockReturnValue({
      push: pushMock,
    } as unknown as NextRouter)

    // Prevent backOff logging after test is completed
    jest.spyOn(pendingSafe, 'pollSafeInfo').mockImplementation(jest.fn())

    const setStatusSpy = jest.fn()
    const setPendingSafeSpy = jest.fn()

    renderHook(
      () =>
        useWatchSafeCreation({
          status: SafeCreationStatus.INDEXED,
          safeAddress: '0x10',
          pendingSafe: {} as PendingSafeData,
          setPendingSafe: setPendingSafeSpy,
          setStatus: setStatusSpy,
          chainId: '4',
        }),
      {
        initialReduxState: {
          chains: {
            data: CONFIG_SERVICE_CHAINS,
            error: undefined,
            loading: false,
          },
        },
      },
    )

    expect(pushMock).toHaveBeenCalledWith({ pathname: AppRoutes.safe.home, query: { safe: 'rin:0x10' } })
  })
})
