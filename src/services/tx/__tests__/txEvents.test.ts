import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { txDispatch, txSubscribe, TxEvent } from '../txEvents'

const tx = {
  safeTxHash: '0x123',
} as unknown as SafeTransaction

describe('txEvents', () => {
  it('should dispatch and subscribe to the PROCESSING event', () => {
    const event = TxEvent.PROCESSING

    const detail = {
      txId: '123',
      txHash: '0x123',
      tx,
    }

    const callback = jest.fn()

    const unsubscribe = txSubscribe(event, callback)

    txDispatch(event, detail)

    expect(callback).toHaveBeenCalledWith(detail)

    const detail2 = {
      txId: '123',
      txHash: '0x456',
      tx,
    }

    txDispatch(event, detail2)

    expect(callback).toHaveBeenCalledWith(detail2)

    unsubscribe()

    txDispatch(event, detail)

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should dispatch and subscribe to the FAILED event', () => {
    const event = TxEvent.FAILED

    const detail = {
      txId: '0x123',
      tx,
      error: new Error('Tx failed'),
    }

    const callback = jest.fn()

    const unsubscribe = txSubscribe(event, callback)

    txDispatch(event, detail)

    expect(callback).toHaveBeenCalledWith(detail)

    unsubscribe()

    txDispatch(event, detail)

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
