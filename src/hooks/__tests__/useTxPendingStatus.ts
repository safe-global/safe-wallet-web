import type { JsonRpcProvider } from 'ethers'
import * as useChainIdHook from '@/hooks/useChainId'
import { useTxMonitor } from '@/hooks/useTxPendingStatuses'
import * as web3 from '@/hooks/wallets/web3'
import * as txMonitor from '@/services/tx/txMonitor'
import { PendingStatus, type PendingTxsState, PendingTxType } from '@/store/pendingTxsSlice'
import { renderHook } from '@/tests/test-utils'

describe('useTxMonitor', () => {
  let mockProvider
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(useChainIdHook, 'default').mockReturnValue('11155111')

    mockProvider = jest.fn() as unknown as JsonRpcProvider
    jest.spyOn(web3, 'useWeb3ReadOnly').mockReturnValue(mockProvider)
  })

  it('should not monitor transactions if provider is not available', () => {
    jest.spyOn(web3, 'useWeb3ReadOnly').mockReturnValue(undefined)
    const mockWaitForTx = jest.spyOn(txMonitor, 'waitForTx')
    const mockWaitForRelayedTx = jest.spyOn(txMonitor, 'waitForRelayedTx')

    renderHook(() => useTxMonitor())

    expect(mockWaitForTx).not.toHaveBeenCalled()
    expect(mockWaitForRelayedTx).not.toHaveBeenCalled()
  })

  it('should not monitor transactions if there are no pending transactions', () => {
    const mockWaitForTx = jest.spyOn(txMonitor, 'waitForTx')
    const mockWaitForRelayedTx = jest.spyOn(txMonitor, 'waitForRelayedTx')

    renderHook(() => useTxMonitor, { initialReduxState: { pendingTxs: {} } })

    expect(mockWaitForTx).not.toHaveBeenCalled()
    expect(mockWaitForRelayedTx).not.toHaveBeenCalled()
  })

  it('should monitor processing transactions', () => {
    const mockWaitForTx = jest.spyOn(txMonitor, 'waitForTx')
    const mockWaitForRelayedTx = jest.spyOn(txMonitor, 'waitForRelayedTx')

    const pendingTx: PendingTxsState = {
      '123': {
        chainId: '11155111',
        safeAddress: '0x123',
        status: PendingStatus.PROCESSING,
        txHash: '0x456',
        submittedAt: Date.now(),
        signerNonce: 1,
        signerAddress: '0x789',
        txType: PendingTxType.SAFE_TX,
      },
    }

    renderHook(() => useTxMonitor(), { initialReduxState: { pendingTxs: pendingTx } })

    expect(mockWaitForTx).toHaveBeenCalled()
    expect(mockWaitForRelayedTx).not.toHaveBeenCalled()
  })

  it('should monitor relaying transactions', () => {
    const mockWaitForTx = jest.spyOn(txMonitor, 'waitForTx')
    const mockWaitForRelayedTx = jest.spyOn(txMonitor, 'waitForRelayedTx')

    const pendingTx: PendingTxsState = {
      '123': {
        chainId: '11155111',
        safeAddress: '0x123',
        status: PendingStatus.RELAYING,
        taskId: '0x456',
      },
    }

    renderHook(() => useTxMonitor(), { initialReduxState: { pendingTxs: pendingTx } })

    expect(mockWaitForRelayedTx).toHaveBeenCalled()
    expect(mockWaitForTx).not.toHaveBeenCalled()
  })

  it('should not monitor already monitored transactions', () => {
    const mockWaitForTx = jest.spyOn(txMonitor, 'waitForTx')

    const pendingTxs: PendingTxsState = {
      '123': {
        chainId: '11155111',
        safeAddress: '0x123',
        status: PendingStatus.PROCESSING,
        txHash: '0x456',
        submittedAt: Date.now(),
        signerNonce: 1,
        signerAddress: '0x789',
        txType: PendingTxType.SAFE_TX,
      },
    }

    const { rerender } = renderHook(() => useTxMonitor(), { initialReduxState: { pendingTxs } })

    rerender()

    expect(mockWaitForTx).toHaveBeenCalledTimes(1)
  })
})
