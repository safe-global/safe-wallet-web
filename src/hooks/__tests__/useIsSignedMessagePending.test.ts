import { renderHook } from '@/tests/test-utils'
import useIsSignedMessagePending from '../useIsSignedMessagePending'

describe('useIsSignedMessagePending', () => {
  it('should return true if the message is pending', () => {
    const { result } = renderHook(() => useIsSignedMessagePending('0x123'), {
      initialReduxState: {
        pendingSignedMessages: {
          '0x123': true,
        },
      },
    })

    expect(result.current).toBe(true)
  })

  it('should return false if the message is not pending', () => {
    const { result } = renderHook(() => useIsSignedMessagePending('0x123'), {
      initialReduxState: {
        pendingSignedMessages: {},
      },
    })

    expect(result.current).toBe(true)
  })
})
