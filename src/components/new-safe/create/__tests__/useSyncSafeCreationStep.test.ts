import { renderHook } from '@/tests/test-utils'
import useSyncSafeCreationStep from '@/components/new-safe/create/useSyncSafeCreationStep'
import * as wallet from '@/hooks/wallets/useWallet'
import * as localStorage from '@/services/local-storage/useLocalStorage'
import type { ConnectedWallet } from '@/services/onboard'
import * as usePendingSafe from '../steps/StatusStep/usePendingSafe'
import * as useIsWrongChain from '@/hooks/useIsWrongChain'

describe('useSyncSafeCreationStep', () => {
  const mockPendingSafe = {
    name: 'joyful-rinkeby-safe',
    threshold: 1,
    owners: [],
    saltNonce: 123,
    address: '0x10',
  }
  const setPendingSafeSpy = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    const setPendingSafeSpy = jest.fn()
  })

  it('should go to the first step if no wallet is connected', async () => {
    jest.spyOn(wallet, 'default').mockReturnValue(null)
    jest.spyOn(usePendingSafe, 'usePendingSafe').mockReturnValue([undefined, setPendingSafeSpy])
    const mockSetStep = jest.fn()

    renderHook(() => useSyncSafeCreationStep(mockSetStep))

    expect(mockSetStep).toHaveBeenCalledWith(0)
  })

  it('should go to the fourth step if there is a pending safe', async () => {
    jest.spyOn(localStorage, 'default').mockReturnValue([{}, jest.fn()])
    jest.spyOn(wallet, 'default').mockReturnValue({ address: '0x1' } as ConnectedWallet)
    jest.spyOn(usePendingSafe, 'usePendingSafe').mockReturnValue([mockPendingSafe, setPendingSafeSpy])

    const mockSetStep = jest.fn()

    renderHook(() => useSyncSafeCreationStep(mockSetStep))

    expect(mockSetStep).toHaveBeenCalledWith(4)
  })

  it('should go to the second step if the wrong chain is connected', async () => {
    jest.spyOn(localStorage, 'default').mockReturnValue([{}, jest.fn()])
    jest.spyOn(wallet, 'default').mockReturnValue({ address: '0x1' } as ConnectedWallet)
    jest.spyOn(usePendingSafe, 'usePendingSafe').mockReturnValue([undefined, setPendingSafeSpy])
    jest.spyOn(useIsWrongChain, 'default').mockReturnValue(true)

    const mockSetStep = jest.fn()

    renderHook(() => useSyncSafeCreationStep(mockSetStep))

    expect(mockSetStep).toHaveBeenCalledWith(1)
  })

  it('should not do anything if wallet is connected and there is no pending safe', async () => {
    jest.spyOn(localStorage, 'default').mockReturnValue([undefined, jest.fn()])
    jest.spyOn(wallet, 'default').mockReturnValue({ address: '0x1' } as ConnectedWallet)
    jest.spyOn(usePendingSafe, 'usePendingSafe').mockReturnValue([undefined, setPendingSafeSpy])
    jest.spyOn(useIsWrongChain, 'default').mockReturnValue(false)

    const mockSetStep = jest.fn()

    renderHook(() => useSyncSafeCreationStep(mockSetStep))

    expect(mockSetStep).not.toHaveBeenCalled()
  })
})
