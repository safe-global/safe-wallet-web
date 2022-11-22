import { renderHook } from '@/tests/test-utils'
import useIsMsgPending from '../useIsMsgPending'

describe('useIsMsgPending', () => {
  it('should return true if the message is pending', () => {
    const { result } = renderHook(() => useIsMsgPending('0x123'), {
      initialReduxState: {
        pendingMsgs: {
          '0x123': true,
        },
      },
    })

    expect(result.current).toBe(true)
  })

  it('should return false if the message is not pending', () => {
    const { result } = renderHook(() => useIsMsgPending('0x123'), {
      initialReduxState: {
        pendingMsgs: {},
      },
    })

    expect(result.current).toBe(true)
  })
})
