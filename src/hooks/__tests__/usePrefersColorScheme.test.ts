import usePrefersColorScheme from '@/hooks/usePrefersColorScheme'
import { renderHook, waitFor } from '@/tests/test-utils'
import MatchMediaMock from 'jest-matchmedia-mock'

let matchMedia: MatchMediaMock

describe('usePrefersColorScheme', () => {
  beforeEach(() => {
    matchMedia = new MatchMediaMock()
  })

  afterEach(() => {
    // There is an open issue that causes the matchMedia to not clear currentMediaQuery
    // https://github.com/dyakovk/jest-matchmedia-mock/issues/11
    matchMedia.destroy()
  })

  it('should return the initial color scheme', () => {
    const { result } = renderHook(() => usePrefersColorScheme())
    const expectedColorScheme = 'no-preference'

    const actualColorScheme = result.current

    expect(actualColorScheme).toBe(expectedColorScheme)
  })

  it('should return dark color scheme', async () => {
    const mediaQuery = '(prefers-color-scheme: dark)'
    const expectedColorScheme = 'dark'

    const { result } = renderHook(() => usePrefersColorScheme())

    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: query === mediaQuery,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
    })

    const mql = window.matchMedia(mediaQuery)
    const darkListener = jest.fn().mockReturnValue('dark')
    mql.addEventListener('change', (ev) => ev.matches && darkListener())

    await waitFor(() => {
      matchMedia.useMediaQuery(mediaQuery)
      const actualColorScheme = result.current
      expect(actualColorScheme).toBe(expectedColorScheme)
    })
  })

  it('should return light color scheme', async () => {
    console.log('matchMedia', matchMedia)
    const mediaQuery = '(prefers-color-scheme: light)'
    const expectedColorScheme = 'light'

    const { result } = renderHook(() => usePrefersColorScheme())

    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: query === mediaQuery,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
    })

    const mql = window.matchMedia(mediaQuery)
    const lightListener = jest.fn().mockReturnValue('light')
    mql.addEventListener('change', (ev) => ev.matches && lightListener())

    await waitFor(() => {
      matchMedia.useMediaQuery(mediaQuery)
      const actualColorScheme = result.current
      expect(actualColorScheme).toBe(expectedColorScheme)
    })
  })
})
