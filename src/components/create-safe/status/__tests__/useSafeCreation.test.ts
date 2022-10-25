import { renderHook } from '@/tests/test-utils'
import { SafeCreationStatus, useSafeCreation } from '@/components/create-safe/status/useSafeCreation'
import * as web3 from '@/hooks/wallets/web3'
import * as chain from '@/hooks/useChains'
import * as wallet from '@/hooks/wallets/useWallet'
import * as logic from '@/components/create-safe/logic'
import { Web3Provider } from '@ethersproject/providers'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import type { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { waitFor } from '@testing-library/react'

const mockSafeInfo = {
  data: '0x',
  from: '0x1',
  to: '0x2',
  nonce: 1,
  value: BigNumber.from(0),
  startBlock: 1,
}

describe('useSafeCreation', () => {
  const mockPendingSafe = {
    name: 'joyful-rinkeby-safe',
    threshold: 1,
    owners: [],
    saltNonce: 123,
    address: '0x10',
  }

  const mockSetPendingSafe = jest.fn()

  const mockStatus = SafeCreationStatus.AWAITING
  const mockSetStatus = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()

    const mockProvider: Web3Provider = new Web3Provider(jest.fn())
    const mockChain = {
      chainId: '4',
    } as unknown as ChainInfo

    jest.spyOn(web3, 'useWeb3').mockImplementation(() => mockProvider)
    jest.spyOn(chain, 'useCurrentChain').mockImplementation(() => mockChain)
    jest.spyOn(wallet, 'default').mockReturnValue({} as ConnectedWallet)
    jest.spyOn(logic, 'getSafeCreationTxInfo').mockReturnValue(Promise.resolve(mockSafeInfo))
  })

  it('should create a safe if there is no txHash and status is AWAITING', async () => {
    const createSafeSpy = jest.spyOn(logic, 'createNewSafe')

    renderHook(() => useSafeCreation(mockPendingSafe, mockSetPendingSafe, mockStatus, mockSetStatus))

    await waitFor(() => {
      expect(createSafeSpy).toHaveBeenCalled()
    })
  })

  it('should not create a safe if the status is not AWAITING', async () => {
    const createSafeSpy = jest.spyOn(logic, 'createNewSafe')

    renderHook(() =>
      useSafeCreation(mockPendingSafe, mockSetPendingSafe, SafeCreationStatus.WALLET_REJECTED, mockSetStatus),
    )

    await waitFor(() => {
      expect(createSafeSpy).not.toHaveBeenCalled()
    })

    renderHook(() => useSafeCreation(mockPendingSafe, mockSetPendingSafe, SafeCreationStatus.PROCESSING, mockSetStatus))

    await waitFor(() => {
      expect(createSafeSpy).not.toHaveBeenCalled()
    })

    renderHook(() => useSafeCreation(mockPendingSafe, mockSetPendingSafe, SafeCreationStatus.ERROR, mockSetStatus))

    await waitFor(() => {
      expect(createSafeSpy).not.toHaveBeenCalled()
    })

    renderHook(() => useSafeCreation(mockPendingSafe, mockSetPendingSafe, SafeCreationStatus.REVERTED, mockSetStatus))

    await waitFor(() => {
      expect(createSafeSpy).not.toHaveBeenCalled()
    })

    renderHook(() => useSafeCreation(mockPendingSafe, mockSetPendingSafe, SafeCreationStatus.TIMEOUT, mockSetStatus))

    await waitFor(() => {
      expect(createSafeSpy).not.toHaveBeenCalled()
    })

    renderHook(() => useSafeCreation(mockPendingSafe, mockSetPendingSafe, SafeCreationStatus.SUCCESS, mockSetStatus))

    await waitFor(() => {
      expect(createSafeSpy).not.toHaveBeenCalled()
    })

    renderHook(() => useSafeCreation(mockPendingSafe, mockSetPendingSafe, SafeCreationStatus.INDEXED, mockSetStatus))

    await waitFor(() => {
      expect(createSafeSpy).not.toHaveBeenCalled()
    })

    renderHook(() =>
      useSafeCreation(mockPendingSafe, mockSetPendingSafe, SafeCreationStatus.INDEX_FAILED, mockSetStatus),
    )

    await waitFor(() => {
      expect(createSafeSpy).not.toHaveBeenCalled()
    })
  })

  it('should not create a safe if there is a txHash', async () => {
    const createSafeSpy = jest.spyOn(logic, 'createNewSafe')

    renderHook(() =>
      useSafeCreation(
        { ...mockPendingSafe, txHash: '0x123' },
        mockSetPendingSafe,
        SafeCreationStatus.AWAITING,
        mockSetStatus,
      ),
    )

    await waitFor(() => {
      expect(createSafeSpy).not.toHaveBeenCalled()
    })
  })

  it('should watch a tx if there is a txHash and a tx object', async () => {
    const watchSafeTxSpy = jest.spyOn(logic, 'checkSafeCreationTx')

    renderHook(() =>
      useSafeCreation(
        { ...mockPendingSafe, txHash: '0x123', tx: mockSafeInfo },
        mockSetPendingSafe,
        mockStatus,
        mockSetStatus,
      ),
    )

    await waitFor(() => {
      expect(watchSafeTxSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('should not watch a tx if there is no txHash', async () => {
    const watchSafeTxSpy = jest.spyOn(logic, 'checkSafeCreationTx')

    renderHook(() =>
      useSafeCreation({ ...mockPendingSafe, tx: mockSafeInfo }, mockSetPendingSafe, mockStatus, mockSetStatus),
    )

    await waitFor(() => {
      expect(watchSafeTxSpy).not.toHaveBeenCalled()
    })
  })

  it('should not watch a tx if there is no tx object', async () => {
    const watchSafeTxSpy = jest.spyOn(logic, 'checkSafeCreationTx')

    renderHook(() =>
      useSafeCreation({ ...mockPendingSafe, txHash: '0x123' }, mockSetPendingSafe, mockStatus, mockSetStatus),
    )

    await waitFor(() => {
      expect(watchSafeTxSpy).not.toHaveBeenCalled()
    })
  })

  it('should set a PROCESSING state when watching a tx', async () => {
    renderHook(() =>
      useSafeCreation(
        { ...mockPendingSafe, txHash: '0x123', tx: mockSafeInfo },
        mockSetPendingSafe,
        mockStatus,
        mockSetStatus,
      ),
    )

    await waitFor(() => {
      expect(mockSetStatus).toHaveBeenCalledWith(SafeCreationStatus.PROCESSING)
    })
  })
})
