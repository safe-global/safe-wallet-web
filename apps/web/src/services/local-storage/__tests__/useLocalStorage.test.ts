import { renderHook, act } from '@/tests/test-utils'
import local from '../local'
import useLocalStorage from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('should set the value', () => {
    const key = Math.random().toString(32)
    const { result } = renderHook(() => useLocalStorage(key))
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
    const key = Math.random().toString(32)
    const { result } = renderHook(() => useLocalStorage<string>(key))
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

  it('should set a bigint value', () => {
    const key = Math.random().toString(32)
    const { result } = renderHook(() => useLocalStorage(key))
    const [value, setValue] = result.current

    expect(value).toBe(undefined)

    act(() => {
      setValue(BigInt(1))
    })

    expect(result.current[0]).toEqual(1n)
  })

  it('should read a bigint value', () => {
    const key = Math.random().toString(32)
    local.setItem(key, { __type: 'bigint', __value: '0x01' })

    const { result } = renderHook(() => useLocalStorage(key))

    expect(result.current[0]).toEqual(1n)
  })

  it('should read from LS on initial call', () => {
    const key = Math.random().toString(32)
    local.setItem(key, 'ls')

    const { result } = renderHook(() => useLocalStorage(key))

    expect(result.current[0]).toBe('ls')
  })
})
