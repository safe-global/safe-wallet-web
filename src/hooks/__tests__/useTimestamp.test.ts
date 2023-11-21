import { renderHook, waitFor } from '@/tests/test-utils'
import { useTimestamp } from '../useTimestamp'

describe('useTimestamp', () => {
  it('should update the timestamp every INTERVAL', async () => {
    jest.useFakeTimers()

    const timestamp = 69_420
    jest.setSystemTime(timestamp)

    const { result } = renderHook(() => useTimestamp(1_000))

    jest.advanceTimersByTime(1_000)

    await waitFor(() => {
      expect(result.current).toBe(timestamp + 1_000)
    })

    jest.advanceTimersByTime(1_000)

    await waitFor(() => {
      expect(result.current).toBe(timestamp + 2_000)
    })

    jest.useRealTimers()
  })
})
