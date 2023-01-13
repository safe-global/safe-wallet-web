import { JsonRpcProvider } from '@ethersproject/providers'
import * as txEvents from '@/services/tx/txEvents'
import * as txMonitor from '@/services/tx/txMonitor'

import type { TransactionReceipt } from '@ethersproject/abstract-provider/lib'

const { waitForTx } = txMonitor

const provider = new JsonRpcProvider()

describe('txMonitor', () => {
  let txDispatchSpy = jest.spyOn(txEvents, 'txDispatch')
  let waitForTxSpy = jest.spyOn(provider, 'waitForTransaction')

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

      await waitForTx(provider, '0x0', '0x0')

      expect(txDispatchSpy).not.toHaveBeenCalled()
    })

    // Not mined/validated:
    it("emits a FAILED event if waitForTransaction isn't blocking and no receipt was returned", async () => {
      // Can return null if waitForTransaction is non-blocking:
      // https://docs.ethers.io/v5/single-page/#/v5/api/providers/provider/-%23-Provider-waitForTransaction
      const receipt = null as unknown as TransactionReceipt

      waitForTxSpy.mockImplementationOnce(() => Promise.resolve(receipt))

      await waitForTx(provider, '0x0', '0x0')

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', { txId: '0x0', error: expect.any(Error) })
    })

    it('emits a FAILED event if the tx mining/validating timed out', async () => {
      waitForTxSpy.mockImplementationOnce(
        () => Promise.resolve(null) as unknown as ReturnType<typeof provider.waitForTransaction>,
      )

      await waitForTx(provider, '0x0', '0x0')

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', {
        txId: '0x0',
        error: new Error('Transaction not processed in 6.5 minutes. Be aware that it might still be processed.'),
      })
    })

    it('emits a REVERTED event if the tx reverted', async () => {
      const receipt = {
        status: 0,
      } as TransactionReceipt

      waitForTxSpy.mockImplementationOnce(() => Promise.resolve(receipt))

      await waitForTx(provider, '0x0', '0x0')

      expect(txDispatchSpy).toHaveBeenCalledWith('REVERTED', {
        txId: '0x0',
        error: new Error('Transaction reverted by EVM.'),
      })
    })

    it('emits a FAILED event if waitForTransaction times out', async () => {
      waitForTxSpy.mockImplementationOnce(() => Promise.reject(new Error('Test error.')))

      await waitForTx(provider, '0x0', '0x0')

      // 6.5 minutes (timeout of txMonitor) + 1ms
      jest.advanceTimersByTime(6.5 * 60_000 + 1)

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', { txId: '0x0', error: expect.any(Error) })
    })

    it('emits a FAILED event if waitForTransaction throws', async () => {
      waitForTxSpy.mockImplementationOnce(() => Promise.reject(new Error('Test error.')))

      await waitForTx(provider, '0x0', '0x0')

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', { txId: '0x0', error: new Error('Test error.') })
    })
  })
})
