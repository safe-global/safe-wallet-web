import { act, renderHook } from '@testing-library/react-hooks'
import useAsync from '../useAsync'

// Jest tests for the useAsync hook
describe('useAsync hook', () => {
  it('should return the correct state when the promise resolves', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve('test'), []))

    expect(result.current).toEqual([undefined, undefined, true])

    // Wait for the promise to resolve
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current).toEqual(['test', undefined, false])
  })

  it('should return the correct state when the promise rejects', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.reject('test'), []))

    expect(result.current).toEqual([undefined, undefined, true])

    // Wait for the promise to resolve
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current).toEqual([undefined, 'test', false])
  })
})
