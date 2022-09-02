import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { useEffect, useMemo, useState } from 'react'
import initTheme from '@/styles/theme'

const isSystemDarkMode = (): boolean => {
  const mediaQuery = '(prefers-color-scheme: dark)'
  return (
    typeof window !== 'undefined' && typeof window.matchMedia !== 'undefined' && window.matchMedia(mediaQuery).matches
  )
}

export const useDarkMode = (): boolean => {
  const settings = useAppSelector(selectSettings)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  useEffect(() => {
    setIsDarkMode(settings.theme.darkMode ?? isSystemDarkMode())
  }, [settings.theme.darkMode])

  return isDarkMode
}

export const useLightDarkTheme = () => {
  const isDarkMode = useDarkMode()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  return useMemo(() => initTheme(isDarkMode), [isDarkMode])
}
