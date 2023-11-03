import { act, renderHook } from '@/tests/test-utils'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { useTxTracking } from '../useTxTracking'
import { trackEvent, WALLET_EVENTS } from '@/services/analytics'
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'

jest.mock('@/services/analytics', () => ({
  trackEvent: jest.fn(),
  WALLET_EVENTS: {
    ONCHAIN_INTERACTION: { category: 'Wallet', action: 'Onchain interaction' },
  },
}))

jest.mock('@/services/tx/txDetails', () => ({
  getTxDetails: jest.fn(() => Promise.resolve({ safeAppInfo: { url: 'google.com' } } as unknown as TransactionDetails)),
}))

describe('useTxTracking', () => {
  it('should track the ONCHAIN_INTERACTION event', async () => {
    renderHook(() => useTxTracking())

    txDispatch(TxEvent.PROCESSING, { txId: '123', txHash: '0x123' })

    await act(() => Promise.resolve())

    expect(trackEvent).toHaveBeenCalledWith({
      ...WALLET_EVENTS.ONCHAIN_INTERACTION,
      label: 'google.com',
    })
  })
})
