import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { useEffect, useMemo, useState } from 'react'
import initTheme from '@/styles/theme'

const mediaQuery = '(prefers-color-scheme: dark)'

export const useDarkMode = () => {
  const settings = useAppSelector(selectSettings)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  useEffect(() => {
    const systemPreference = window.matchMedia(mediaQuery)
    setIsDarkMode(settings.theme.darkMode ?? systemPreference.matches)

    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode, settings.theme.darkMode])

  return useMemo(() => initTheme(isDarkMode), [isDarkMode])
}
