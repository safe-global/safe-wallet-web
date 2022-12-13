import { useEffect, useState } from 'react'

type ColorSchemeType = 'dark' | 'light' | 'no-preference'

const usePrefersColorScheme = (): ColorSchemeType => {
  const [preferredColorScheme, setPreferredColorScheme] = useState<ColorSchemeType>('no-preference')

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const isDark = window.matchMedia('(prefers-color-scheme: dark)')
    const isLight = window.matchMedia('(prefers-color-scheme: light)')

    const listener =
      (type: ColorSchemeType) =>
      ({ matches }: MediaQueryListEvent) => {
        matches && setPreferredColorScheme(type)
      }

    const darkListener = listener('dark')
    const lightListener = listener('light')

    isDark.addEventListener('change', darkListener)
    isLight.addEventListener('change', lightListener)

    return () => {
      isDark.removeEventListener('change', darkListener)
      isLight.removeEventListener('change', lightListener)
    }
  }, [])

  return preferredColorScheme
}

export default usePrefersColorScheme
