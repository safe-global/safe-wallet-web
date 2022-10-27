import { renderHook, act } from '@/tests/test-utils'
import local from '../local'
import useLocalStorage from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('should set the value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key'))
    const [value, setValue] = result.current

    expect(value).toBe(undefined)

    act(() => {
      setValue('test')
    })

    expect(result.current[0]).toBe('test')

    act(() => {
      setValue('test2')
    })

    expect(result.current[0]).toBe('test2')
  })

  it('should set the value using a callback', () => {
    const { result } = renderHook(() => useLocalStorage<string>('test-key'))
    const [value, setValue] = result.current

    expect(value).toBe(undefined)

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
    local.setItem('test-key', 'ls')

    const { result } = renderHook(() => useLocalStorage('test-key'))

    expect(result.current[0]).toBe('ls')
  })

  it('should save the initial value to the LS', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    expect(result.current[0]).toBe('initial')
    expect(local.getItem('test-key')).toBe('initial')
  })

  it('should NOT save the initial value to the LS if LS is already populated', () => {
    local.setItem('test-key', 'ls')

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    expect(result.current[0]).toBe('ls')
    expect(local.getItem('test-key')).toBe('ls')
  })
})
