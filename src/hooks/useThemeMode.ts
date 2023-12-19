import React, { useCallback, useState } from 'react'
import { PaletteMode, Theme } from '@mui/material'
import createSafeTheme from '@/components/theme/safeTheme'

type useThemeModeType = (initialThemeMode?: PaletteMode) => {
  theme: Theme
  themeMode: PaletteMode
  switchThemeMode: () => void
}

const LIGHT_THEME_MODE = 'light'
const DARK_THEME_MODE = 'dark'

const useThemeMode: useThemeModeType = (initialThemeMode = LIGHT_THEME_MODE) => {
  const [themeMode, setThemeMode] = useState<PaletteMode>(initialThemeMode)

  const switchThemeMode = useCallback(() => {
    setThemeMode((prevThemeMode: PaletteMode) =>
      prevThemeMode === LIGHT_THEME_MODE ? DARK_THEME_MODE : LIGHT_THEME_MODE,
    )
  }, [])

  const theme = React.useMemo(() => createSafeTheme(themeMode), [themeMode])

  return {
    theme,
    themeMode,
    switchThemeMode,
  }
}

export default useThemeMode
