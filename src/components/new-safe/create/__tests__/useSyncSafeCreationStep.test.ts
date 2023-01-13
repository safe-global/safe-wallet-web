import { renderHook } from '@/tests/test-utils'
import useSyncSafeCreationStep from '@/components/new-safe/create/useSyncSafeCreationStep'
import * as wallet from '@/hooks/wallets/useWallet'
import * as localStorage from '@/services/local-storage/useLocalStorage'
import type { ConnectedWallet } from '@/services/onboard'

describe('useSyncSafeCreationStep', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should go to the first step if no wallet is connected', async () => {
    jest.spyOn(wallet, 'default').mockReturnValue(null)
    const mockSetStep = jest.fn()

    renderHook(() => useSyncSafeCreationStep(mockSetStep))

    expect(mockSetStep).toHaveBeenCalledWith(0)
  })

  it('should go to the fourth step if there is a pending safe', async () => {
    jest.spyOn(localStorage, 'default').mockReturnValue([{}, jest.fn()])
    jest.spyOn(wallet, 'default').mockReturnValue({ address: '0x1' } as ConnectedWallet)
    const mockSetStep = jest.fn()

    renderHook(() => useSyncSafeCreationStep(mockSetStep))

    expect(mockSetStep).toHaveBeenCalledWith(4)
  })

  it('should not do anything if wallet is connected and there is no pending safe', async () => {
    jest.spyOn(localStorage, 'default').mockReturnValue([undefined, jest.fn()])
    jest.spyOn(wallet, 'default').mockReturnValue({ address: '0x1' } as ConnectedWallet)
    const mockSetStep = jest.fn()

    renderHook(() => useSyncSafeCreationStep(mockSetStep))

    expect(mockSetStep).not.toHaveBeenCalled()
  })
})
