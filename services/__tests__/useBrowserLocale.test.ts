import { renderHook } from '@testing-library/react-hooks'
import useBrowserLocale from '../useBrowserLocale'

// Jest tests for the useBrowserLocale hook
describe('useBrowserLocale hook', () => {
  it('should return de-DE when the navigator.language is de-DE', () => {
    // Check that the initial state is en-US
    const locale = renderHook(() => useBrowserLocale()).result.current
    expect(locale).toEqual('en-US')

    // Mock window navigator language
    Object.defineProperties(navigator, {
      language: {
        get: () => 'de-DE',
      },
    })

    // Check that the state is now de-DE
    const locale2 = renderHook(() => useBrowserLocale()).result.current
    expect(locale2).toEqual('de-DE')
  })
})
