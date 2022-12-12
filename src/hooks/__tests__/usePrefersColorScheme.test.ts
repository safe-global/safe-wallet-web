import usePrefersColorScheme from '@/hooks/usePrefersColorScheme'
import { renderHook } from '@/tests/test-utils'

describe('usePrefersColorScheme', () => {
  it('should return the initial color scheme', () => {
    const { result } = renderHook(() => usePrefersColorScheme())
    const expectedColorScheme = 'no-preference'

    const actualColorScheme = result.current

    expect(actualColorScheme).toBe(expectedColorScheme)
  })
})
