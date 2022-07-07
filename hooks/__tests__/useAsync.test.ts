import { useEffect, useState } from 'react'
import { act, renderHook } from '@/tests/test-utils'
import useAsync from '@/hooks/useAsync'

// Jest tests for the useAsync hook
describe('useAsync hook', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

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

  it('should clear the data between reloads', async () => {
    const dataValues: Array<string | undefined> = []

    const useTestHook = () => {
      const [test, setTest] = useState('test 1')
      const [data, error, loading] = useAsync(() => Promise.resolve(test), [test])

      useEffect(() => {
        setTimeout(() => {
          setTest('test 2')
        }, 10)
      }, [])

      useEffect(() => {
        dataValues.push(data)
      }, [data])

      return { data, error, loading }
    }

    let hookResult: { current: ReturnType<typeof useTestHook> } | undefined = undefined
    await act(async () => {
      const { result } = renderHook(useTestHook)
      hookResult = result
    })

    expect(hookResult!.current.data).toEqual('test 1')

    await act(async () => {
      jest.advanceTimersByTime(10)
    })

    expect(hookResult!.current.data).toEqual('test 2')
    expect(dataValues).toEqual([undefined, 'test 1', undefined, 'test 2'])
  })

  it('should NOT clear the data between reloads when passed false', async () => {
    const dataValues: Array<string | undefined> = []

    const useTestHook = () => {
      const [test, setTest] = useState('test 1')
      const [data, error, loading] = useAsync(() => Promise.resolve(test), [test], false)

      useEffect(() => {
        setTimeout(() => {
          setTest('test 2')
        }, 10)
      }, [])

      useEffect(() => {
        dataValues.push(data)
      }, [data])

      return { data, error, loading }
    }

    let hookResult: { current: ReturnType<typeof useTestHook> } | undefined = undefined
    await act(async () => {
      const { result } = renderHook(useTestHook)
      hookResult = result
    })

    expect(hookResult!.current.data).toEqual('test 1')

    await act(async () => {
      jest.advanceTimersByTime(10)
    })

    expect(hookResult!.current.data).toEqual('test 2')
    expect(dataValues).toEqual([undefined, 'test 1', 'test 2'])
  })
})
