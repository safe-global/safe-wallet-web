import { renderHook } from '@/tests/test-utils'
import useIsSafeMessagePending from '../useIsSafeMessagePending'

describe('useIsSafeMessagePending', () => {
  it('should return true if the message is pending', () => {
    const { result } = renderHook(() => useIsSafeMessagePending('0x123'), {
      initialReduxState: {
        pendingSafeMessages: {
          '0x123': true,
        },
      },
    })

    expect(result.current).toBe(true)
  })

  it('should return false if the message is not pending', () => {
    const { result } = renderHook(() => useIsSafeMessagePending('0x123'), {
      initialReduxState: {
        pendingSafeMessages: {},
      },
    })

    expect(result.current).toBe(true)
  })
})
