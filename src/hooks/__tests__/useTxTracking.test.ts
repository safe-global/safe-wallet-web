import * as analytics from '@/services/analytics'
import { WALLET_EVENTS } from '@/services/analytics'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { renderHook } from '@/tests/test-utils'
import { useTxTracking } from '../useTxTracking'

describe('useTxTracking', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should track relayed executions', () => {
    const trackEventSpy = jest.spyOn(analytics, 'trackEvent')
    renderHook(() => useTxTracking())

    txDispatch(TxEvent.RELAYING, {
      taskId: '0x123',
      groupKey: '0x234',
    })
    expect(trackEventSpy).toBeCalledWith({ ...WALLET_EVENTS.RELAYED_EXECUTION, label: undefined })
  })

  it('should track tx signing', () => {
    const trackEventSpy = jest.spyOn(analytics, 'trackEvent')
    renderHook(() => useTxTracking())

    txDispatch(TxEvent.SIGNED, {
      txId: '0x123',
    })
    expect(trackEventSpy).toBeCalledWith({ ...WALLET_EVENTS.OFF_CHAIN_SIGNATURE, label: undefined })
  })

  it('should track tx execution', () => {
    const trackEventSpy = jest.spyOn(analytics, 'trackEvent')
    renderHook(() => useTxTracking())

    txDispatch(TxEvent.PROCESSING, {
      txId: '0x123',
      txHash: '0x234',
    })
    expect(trackEventSpy).toBeCalledWith({ ...WALLET_EVENTS.ON_CHAIN_INTERACTION, label: undefined })
  })
})
