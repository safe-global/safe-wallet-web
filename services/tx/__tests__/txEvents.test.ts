import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { txDispatch, txSubscribe, TxEvent } from '../txEvents'

const tx = {
  safeTxHash: '0x123',
} as unknown as SafeTransaction

describe('txEvents', () => {
  it('should dispatch and subscribe to the MINING event', () => {
    const event = TxEvent.MINING

    const detail = {
      txHash: '0x123',
    }

    const callback = jest.fn()

    const unsubscribe = txSubscribe(event, callback)

    txDispatch(event, detail)

    expect(callback).toHaveBeenCalledWith(detail)

    const detail2 = {
      txHash: '0x456',
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
      txHash: '0x123',
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
