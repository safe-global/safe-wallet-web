import { _getRemainingTimeout } from '@/services/tx/txMonitor'
import * as txEvents from '@/services/tx/txEvents'
import * as txMonitor from '@/services/tx/txMonitor'

import { act } from '@testing-library/react'
import { SafeCreationStatus } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'
import { toBeHex } from 'ethers'
import { BrowserProvider, type JsonRpcProvider, type Eip1193Provider, type TransactionReceipt } from 'ethers'

const { waitForTx, waitForRelayedTx, waitForCreateSafeTx } = txMonitor

const provider = new BrowserProvider(jest.fn() as unknown as Eip1193Provider) as unknown as JsonRpcProvider

const setupFetchStub = (data: any) => (_url: string) => {
  return Promise.resolve({
    json: () => Promise.resolve(data),
    status: 200,
    ok: true,
  })
}

describe('txMonitor', () => {
  let txDispatchSpy = jest.spyOn(txEvents, 'txDispatch')
  let waitForTxSpy = jest.spyOn(provider, 'waitForTransaction')
  const safeAddress = toBeHex('0x123', 20)

  beforeEach(() => {
    jest.useFakeTimers()
    jest.resetAllMocks()

    txDispatchSpy = jest.spyOn(txEvents, 'txDispatch')
    waitForTxSpy = jest.spyOn(provider, 'waitForTransaction')
  })

  describe('waitForTx', () => {
    // Mined/validated:
    it("doesn't emit an event if the tx was successfully mined/validated", async () => {
      const receipt = {
        status: 1,
      } as TransactionReceipt

      waitForTxSpy.mockImplementationOnce(() => Promise.resolve(receipt))

      await waitForTx(provider, ['0x0'], '0x0')

      expect(txDispatchSpy).not.toHaveBeenCalled()
    })

    // Not mined/validated:
    it("emits a FAILED event if waitForTransaction isn't blocking and no receipt was returned", async () => {
      // Can return null if waitForTransaction is non-blocking:
      // https://docs.ethers.io/v5/single-page/#/v5/api/providers/provider/-%23-Provider-waitForTransaction
      const receipt = null as unknown as TransactionReceipt

      waitForTxSpy.mockImplementationOnce(() => Promise.resolve(receipt))

      await waitForTx(provider, ['0x0'], '0x0')

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', { txId: '0x0', error: expect.any(Error) })
    })

    it('emits a FAILED event if the tx mining/validating timed out', async () => {
      waitForTxSpy.mockImplementationOnce(
        () => Promise.resolve(null) as unknown as ReturnType<typeof provider.waitForTransaction>,
      )

      await waitForTx(provider, ['0x0'], '0x0')

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', {
        txId: '0x0',
        error: new Error('Transaction not processed in 1 minute. Be aware that it might still be processed.'),
      })
    })

    it('emits a REVERTED event if the tx reverted', async () => {
      const receipt = {
        status: 0,
      } as TransactionReceipt

      waitForTxSpy.mockImplementationOnce(() => Promise.resolve(receipt))

      await waitForTx(provider, ['0x0'], '0x0')

      expect(txDispatchSpy).toHaveBeenCalledWith('REVERTED', {
        txId: '0x0',
        error: new Error('Transaction reverted by EVM.'),
      })
    })

    it('emits a FAILED event if waitForTransaction times out', async () => {
      waitForTxSpy.mockImplementationOnce(() => Promise.reject(new Error('Test error.')))

      await waitForTx(provider, ['0x0'], '0x0')

      // 1 minute (timeout of txMonitor) + 1ms
      jest.advanceTimersByTime(60_000 + 1)

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', { txId: '0x0', error: expect.any(Error) })
    })

    it('emits a FAILED event if waitForTransaction throws', async () => {
      waitForTxSpy.mockImplementationOnce(() => Promise.reject(new Error('Test error.')))

      await waitForTx(provider, ['0x0'], '0x0')

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', { txId: '0x0', error: new Error('Test error.') })
    })
  })

  describe('waitForRelayedTx', () => {
    it("emits a PROCESSED event if taskStatus 'ExecSuccess'", async () => {
      const mockData = {
        task: {
          taskState: 'ExecSuccess',
        },
      }
      global.fetch = jest.fn().mockImplementation(setupFetchStub(mockData))

      const mockFetch = jest.spyOn(global, 'fetch')

      waitForRelayedTx('0x1', ['0x2'], safeAddress)

      await act(() => {
        jest.advanceTimersByTime(15_000 + 1)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(txDispatchSpy).toHaveBeenCalledWith('PROCESSED', { txId: '0x2', safeAddress })

      // The relay timeout should have been cancelled
      txDispatchSpy.mockClear()
      await act(() => {
        jest.advanceTimersByTime(3 * 60_000 + 1)
      })
      expect(txDispatchSpy).not.toHaveBeenCalled()
    })

    it("emits a REVERTED event if taskStatus 'ExecReverted'", async () => {
      const mockData = {
        task: {
          taskState: 'ExecReverted',
        },
      }
      global.fetch = jest.fn().mockImplementation(setupFetchStub(mockData))

      const mockFetch = jest.spyOn(global, 'fetch')

      waitForRelayedTx('0x1', ['0x2'], safeAddress)

      await act(() => {
        jest.advanceTimersByTime(15_000 + 1)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(txDispatchSpy).toHaveBeenCalledWith('REVERTED', {
        txId: '0x2',
        error: new Error(`Relayed transaction reverted by EVM.`),
      })

      // The relay timeout should have been cancelled
      txDispatchSpy.mockClear()
      await act(() => {
        jest.advanceTimersByTime(3 * 60_000 + 1)
      })
      expect(txDispatchSpy).not.toHaveBeenCalled()
    })

    it("emits a FAILED event if taskStatus 'Blacklisted'", async () => {
      const mockData = {
        task: {
          taskState: 'Blacklisted',
        },
      }
      global.fetch = jest.fn().mockImplementation(setupFetchStub(mockData))

      const mockFetch = jest.spyOn(global, 'fetch')

      waitForRelayedTx('0x1', ['0x2'], safeAddress)

      await act(() => {
        jest.advanceTimersByTime(15_000 + 1)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', {
        txId: '0x2',
        error: new Error(`Relayed transaction was blacklisted by relay provider.`),
      })

      // The relay timeout should have been cancelled
      txDispatchSpy.mockClear()
      await act(() => {
        jest.advanceTimersByTime(3 * 60_000 + 1)
      })
      expect(txDispatchSpy).not.toHaveBeenCalled()
    })

    it("emits a FAILED event if taskStatus 'Cancelled'", async () => {
      const mockData = {
        task: {
          taskState: 'Cancelled',
        },
      }
      global.fetch = jest.fn().mockImplementation(setupFetchStub(mockData))

      const mockFetch = jest.spyOn(global, 'fetch')

      waitForRelayedTx('0x1', ['0x2'], safeAddress)

      await act(() => {
        jest.advanceTimersByTime(15_000 + 1)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', {
        txId: '0x2',
        error: new Error(`Relayed transaction was cancelled by relay provider.`),
      })

      // The relay timeout should have been cancelled
      txDispatchSpy.mockClear()
      await act(() => {
        jest.advanceTimersByTime(3 * 60_000 + 1)
      })
      expect(txDispatchSpy).not.toHaveBeenCalled()
    })

    it("emits a FAILED event if taskStatus 'NotFound'", async () => {
      const mockData = {
        task: {
          taskState: 'NotFound',
        },
      }
      global.fetch = jest.fn().mockImplementation(setupFetchStub(mockData))

      const mockFetch = jest.spyOn(global, 'fetch')

      waitForRelayedTx('0x1', ['0x2'], safeAddress)

      await act(() => {
        jest.advanceTimersByTime(15_000 + 1)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', {
        txId: '0x2',
        error: new Error(`Relayed transaction was not found.`),
      })

      // The relay timeout should have been cancelled
      txDispatchSpy.mockClear()
      await act(() => {
        jest.advanceTimersByTime(3 * 60_000 + 1)
      })
      expect(txDispatchSpy).not.toHaveBeenCalled()
    })

    it('emits a FAILED event if the tx relaying timed out', async () => {
      const mockData = {
        task: {
          taskState: 'WaitingForConfirmation',
        },
      }
      global.fetch = jest.fn().mockImplementation(setupFetchStub(mockData))

      waitForRelayedTx('0x1', ['0x2'], safeAddress)

      await act(() => {
        jest.advanceTimersByTime(3 * 60_000 + 1)
      })

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', {
        txId: '0x2',
        error: new Error('Transaction not relayed in 3 minutes. Be aware that it might still be relayed.'),
      })
    })
  })

  describe('waitForCreateSafeTx', () => {
    it("sets the status to SUCCESS if taskStatus 'ExecSuccess'", async () => {
      const mockData = {
        task: {
          taskState: 'ExecSuccess',
        },
      }
      global.fetch = jest.fn().mockImplementation(setupFetchStub(mockData))

      const mockFetch = jest.spyOn(global, 'fetch')
      const setStatusSpy = jest.fn()

      waitForCreateSafeTx('0x1', setStatusSpy)

      await act(() => {
        jest.advanceTimersByTime(15_000 + 1)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(setStatusSpy).toHaveBeenCalledWith(SafeCreationStatus.SUCCESS)
    })

    it("sets the status to ERROR if taskStatus 'ExecReverted'", async () => {
      const mockData = {
        task: {
          taskState: 'ExecReverted',
        },
      }
      global.fetch = jest.fn().mockImplementation(setupFetchStub(mockData))

      const mockFetch = jest.spyOn(global, 'fetch')
      const setStatusSpy = jest.fn()

      waitForCreateSafeTx('0x1', setStatusSpy)

      await act(() => {
        jest.advanceTimersByTime(15_000 + 1)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(setStatusSpy).toHaveBeenCalledWith(SafeCreationStatus.ERROR)
    })

    it("sets the status to ERROR if taskStatus 'Blacklisted'", async () => {
      const mockData = {
        task: {
          taskState: 'Blacklisted',
        },
      }
      global.fetch = jest.fn().mockImplementation(setupFetchStub(mockData))

      const mockFetch = jest.spyOn(global, 'fetch')
      const setStatusSpy = jest.fn()

      waitForCreateSafeTx('0x1', setStatusSpy)

      await act(() => {
        jest.advanceTimersByTime(15_000 + 1)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(setStatusSpy).toHaveBeenCalledWith(SafeCreationStatus.ERROR)
    })

    it("sets the status to ERROR if taskStatus 'Cancelled'", async () => {
      const mockData = {
        task: {
          taskState: 'Cancelled',
        },
      }
      global.fetch = jest.fn().mockImplementation(setupFetchStub(mockData))

      const mockFetch = jest.spyOn(global, 'fetch')
      const setStatusSpy = jest.fn()

      waitForCreateSafeTx('0x1', setStatusSpy)

      await act(() => {
        jest.advanceTimersByTime(15_000 + 1)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(setStatusSpy).toHaveBeenCalledWith(SafeCreationStatus.ERROR)
    })

    it("sets the status to ERROR if taskStatus 'NotFound'", async () => {
      const mockData = {
        task: {
          taskState: 'NotFound',
        },
      }
      global.fetch = jest.fn().mockImplementation(setupFetchStub(mockData))

      const mockFetch = jest.spyOn(global, 'fetch')
      const setStatusSpy = jest.fn()

      waitForCreateSafeTx('0x1', setStatusSpy)

      await act(() => {
        jest.advanceTimersByTime(15_000 + 1)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(setStatusSpy).toHaveBeenCalledWith(SafeCreationStatus.ERROR)
    })

    it('sets the status to ERROR if the tx relaying timed out', async () => {
      const mockData = {
        task: {
          taskState: 'WaitingForConfirmation',
        },
      }
      global.fetch = jest.fn().mockImplementation(setupFetchStub(mockData))

      const mockFetch = jest.spyOn(global, 'fetch')
      const setStatusSpy = jest.fn()

      waitForCreateSafeTx('0x1', setStatusSpy)

      await act(() => {
        jest.advanceTimersByTime(3 * 60_000 + 1)
      })

      expect(mockFetch).toHaveBeenCalled()
      expect(setStatusSpy).toHaveBeenCalledWith(SafeCreationStatus.ERROR)
    })
  })
})

describe('getRemainingTimeout', () => {
  const DefaultTimeout = 1

  it('returns 1 if submission is older than 1 minute', () => {
    const result = _getRemainingTimeout(DefaultTimeout, Date.now() - DefaultTimeout * 60_000)

    expect(result).toBe(1)
  })

  it('returns default timeout in milliseconds if no submission time was passed', () => {
    const result = _getRemainingTimeout(DefaultTimeout)

    expect(result).toBe(DefaultTimeout * 60_000)
  })

  it('returns remaining timeout', () => {
    const passedMinutes = DefaultTimeout - 0.4
    const result = _getRemainingTimeout(DefaultTimeout, Date.now() - passedMinutes * 60_000)

    expect(result).toBe((DefaultTimeout - passedMinutes) * 60_000)
  })
})
