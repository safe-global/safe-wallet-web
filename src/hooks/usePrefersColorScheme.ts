import { useEffect, useState } from 'react'

type ColorSchemeType = 'dark' | 'light' | 'no-preference'

const usePrefersColorScheme = (): ColorSchemeType => {
  const [preferredColorScheme, setPreferredColorScheme] = useState<ColorSchemeType>('no-preference')

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const preferDark = window.matchMedia('(prefers-color-scheme: dark)')

    const listener = ({ matches }: MediaQueryListEvent) => {
      matches ? setPreferredColorScheme('dark') : setPreferredColorScheme('light')
    }

    preferDark.addEventListener('change', listener)

    return () => {
      preferDark.removeEventListener('change', listener)
    }
  }, [])

  return preferredColorScheme
}

export default usePrefersColorScheme
