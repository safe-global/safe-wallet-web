import * as txEvents from '@/services/tx/txEvents'
import * as txMonitor from '@/services/tx/txMonitor'
import * as web3 from '@/services/wallets/web3'

import type { TransactionReceipt } from '@ethersproject/abstract-provider/lib'

const { waitForTx } = txMonitor

describe('txMonitor', () => {
  let txDispatchSpy = jest.spyOn(txEvents, 'txDispatch')
  let web3ReadOnlySpy = jest.spyOn(web3, 'getWeb3ReadOnly')

  beforeEach(() => {
    jest.useFakeTimers()
    jest.resetAllMocks()

    txDispatchSpy = jest.spyOn(txEvents, 'txDispatch')
    web3ReadOnlySpy = jest.spyOn(web3, 'getWeb3ReadOnly')
  })

  describe('waitForTx', () => {
    // Mined:
    it("doesn't emit an event if the tx was successfully mined", async () => {
      const receipt = {
        status: 1,
      } as TransactionReceipt

      web3ReadOnlySpy.mockImplementationOnce(
        () =>
          ({
            waitForTransaction: () => Promise.resolve(receipt),
          } as unknown as ReturnType<typeof web3.getWeb3ReadOnly>),
      )

      const provider = web3.getWeb3ReadOnly()

      await waitForTx(provider, '0x0', '0x0')

      expect(txDispatchSpy).not.toHaveBeenCalled()
    })
    // Not mined:
    it("emits a FAILED event if waitForTransaction isn't blocking and no receipt was returned", async () => {
      // Can return null if waitForTransaction is non-blocking:
      // https://docs.ethers.io/v5/single-page/#/v5/api/providers/provider/-%23-Provider-waitForTransaction
      const receipt = null as unknown as TransactionReceipt

      web3ReadOnlySpy.mockImplementationOnce(
        () =>
          ({
            waitForTransaction: () => Promise.resolve(receipt),
          } as unknown as ReturnType<typeof web3.getWeb3ReadOnly>),
      )

      const provider = web3.getWeb3ReadOnly()

      await waitForTx(provider, '0x0', '0x0')

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', { txId: '0x0', error: expect.any(Error) })
    })
    it('emits a FAILED event if the tx reverted', async () => {
      const receipt = {
        status: 0,
      } as TransactionReceipt

      web3ReadOnlySpy.mockImplementationOnce(
        () =>
          ({ waitForTransaction: () => Promise.resolve(receipt) } as unknown as ReturnType<
            typeof web3.getWeb3ReadOnly
          >),
      )

      const provider = web3.getWeb3ReadOnly()

      await waitForTx(provider, '0x0', '0x0')

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', {
        txId: '0x0',
        error: new Error('Transaction not mined in 6.5 minutes. Be aware that it might still be mined.'),
      })
    })
    it('emits a FAILED event if waitForTransaction times out', async () => {
      web3ReadOnlySpy.mockImplementationOnce(
        () =>
          ({
            waitForTransaction: () => Promise.reject(new Error('Test error.')),
          } as unknown as ReturnType<typeof web3.getWeb3ReadOnly>),
      )

      const provider = web3.getWeb3ReadOnly()

      await waitForTx(provider, '0x0', '0x0')

      // 6.5 minutes (timeout of txMonitor) + 1ms
      jest.advanceTimersByTime(6.5 * 60_000 + 1)

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', { txId: '0x0', error: expect.any(Error) })
    })
    it('emits a FAILED event if waitForTransaction throws', async () => {
      web3ReadOnlySpy.mockImplementationOnce(
        () =>
          ({
            waitForTransaction: () => Promise.reject(new Error('Test error.')),
          } as unknown as ReturnType<typeof web3.getWeb3ReadOnly>),
      )

      const provider = web3.getWeb3ReadOnly()

      await waitForTx(provider, '0x0', '0x0')

      expect(txDispatchSpy).toHaveBeenCalledWith('FAILED', { txId: '0x0', error: new Error('Test error.') })
    })
  })
})
