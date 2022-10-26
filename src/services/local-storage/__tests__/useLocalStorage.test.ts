import { renderHook, act, waitFor } from '@/tests/test-utils'
import useLocalStorage from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('should return the initial value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'test'))

    expect(result.current[0]).toBe('test')
  })

  it('should set the value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'test'))
    const [value, setValue] = result.current

    expect(value).toBe('test')

    act(() => {
      setValue('test2')
    })

    expect(result.current[0]).toBe('test2')
  })

  it('should set the value using a callback', () => {
    const { result } = renderHook(() => useLocalStorage<string>('test-key', 'test'))
    const [value, setValue] = result.current

    expect(value).toBe('test')

    act(() => {
      setValue('test2')
    })

    act(() => {
      setValue((prevVal) => {
        return prevVal === 'test2' ? 'test3' : 'wrong'
      })
    })

    expect(result.current[0]).toBe('test3')
  })

  it('should read from LS on initial call', () => {
    localStorage.setItem('test-key', 'ls')

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    expect(result.current[0]).toBe('initial')

    waitFor(() => expect(result.current[0]).toBe('ls'))
  })
})
