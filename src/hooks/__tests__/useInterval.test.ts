import { act, renderHook } from '@testing-library/react'
import useInterval from '../useInterval'

describe('useInterval', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  it('should run the callback function once immediately', () => {
    let mockValue = 0
    const mockCallback = jest.fn(() => mockValue++)

    renderHook(() => useInterval(mockCallback, 100))

    expect(mockValue).toEqual(1)
  })

  it('should run the callback function with every interval', async () => {
    let mockValue = 0
    const mockCallback = jest.fn(() => mockValue++)

    renderHook(() => useInterval(mockCallback, 100))

    expect(mockValue).toEqual(1)

    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(mockValue).toEqual(2)

    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(mockValue).toEqual(3)
  })
})
